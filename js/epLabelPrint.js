export class EPLabelPrint {
    interpolateStringTemplate = (tmpl, data, defaultValue = '?', reg) => {
        return tmpl.replace(reg || /\${([^{}]*)}/g, function (a, b) {
            try { return new Function('data', ['with(data){return ', b, ' ?? \'', (defaultValue || ''), '\';}'].join(''))(data); }
            catch (e) { return defaultValue || ''; }
        });
    }

    generateElementToPrintOfString = (jsonStr, templateStr) => {
        return this.generateElementToPrint(JSON.parse(jsonStr), $(templateStr));
    }

    generateElementToPrint = (object, template) => {
        if (!(template instanceof jQuery)) template = $(template);

        const element = $('<html>');
        const page = template;
        const row = page.find('#row');
        const content = page.find('#content');

        row.css('width', page.css('width'));

        element.append($(`<style>
                    * {
                        box-sizing: border-box;
                    }
                    #page, #content { background: #fff !important; }
                    html { height: fit-content !important; }
                    body { overflow: auto; margin: 0; color: #000; }
                    .draggable {
                        position: absolute;
                    }
                    div[data-id='barcode'] canvas {
                        max-width: 100%;
                        display: block;
                        margin: 0 auto;
                    }
                    @page {
                        size: ${page[0].style.width} ${content[0].style.height};
                    }
                    </style>`));

        const columns = parseFloat(page.attr('data-columns')) || 1;
        const rows = parseFloat(page.attr('data-rows')) || 1;
        const getNewRow = () => row.clone().empty();
        const getNewPage = () => page.clone().empty();

        let currentColumn = 1;
        let currentRow = 1;
        let pageCopy = getNewPage();
        let rowCopy = getNewRow();
        object.tags.forEach(tag => {
            const generatedContentWithDataTag = $(
                this.interpolateStringTemplate(
                    content[0].outerHTML,
                    tag.data
                )
            );

            for (let i = tag.qty; i > 0; i--) {
                let contentCopy = generatedContentWithDataTag.clone();

                contentCopy.find('div[data-id="barcode"]').each((i, el) => {
                    $(el).find('canvas').attr('data-value', $(el).attr('data-code-tag'));
                    try { $(el).find('canvas').JsBarcode().init(); } catch (e) { console.log(e); }
                });

                if (currentColumn > columns && currentRow < rows) {
                    currentColumn = 1;
                    currentRow += 1;
                    pageCopy.append(rowCopy);
                    rowCopy = getNewRow();
                } else if (currentColumn > columns && currentRow >= rows) {
                    currentColumn = 1;
                    currentRow = 1;
                    pageCopy.append(rowCopy);
                    element.append(pageCopy);
                    pageCopy = getNewPage();
                    rowCopy = getNewRow();
                }

                if (currentColumn === 1) contentCopy.css('margin-left', '0');

                rowCopy.append(contentCopy);
                currentColumn += 1;
            }
        });

        pageCopy.append(rowCopy);
        element.append(pageCopy);

        return element;
    }

    printElementInPDF = async (element) => {
        const content = element.find('#content');
        const page = element.find('#page');
        const doc = new window.jspdf.jsPDF(
            page.attr('data-orientation') || 'l',
            'mm',
            [
                (parseFloat(content[0].style.height) * (parseFloat(page.attr('data-rows')) || 1)) 
                * 
                (parseFloat(page.attr('data-fator')) || 0.99013), 
                parseFloat(page[0].style.width)
            ],
            false
        );

        await doc.html(element[0], {
            callback: (doc) => {
                const pageCount = doc.internal.getNumberOfPages();
                if (pageCount > 1) doc.deletePage(pageCount);
                return doc;
            },
            x: 0,
            y: 0,
            windowWidth: parseFloat(page[0].style.width) * 3.7795280352161, //window width in CSS pixels,
            html2canvas: { scale: parseFloat(page.attr('data-scale')) || 0.262, dpi: parseFloat(page.attr('data-dpi')) || 300 }
        });

        return doc;
    }
};

export const epLabelPrint = (function () {
    return window.epLabelPrint = new EPLabelPrint()
})();