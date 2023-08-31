# Thermal Label Builder
Thermal label builder in Javascript/jQuery, allows the user to create their own thermal label, and generate a PDF for printing. Can be added as a library in another project.

# Demo
https://epconnect.com.br/criaretiqueta/

# JSON file data pattern
```JSON
{
    "tags": [
        {
            "qty": 5,
            "data": {
                "codigo": "2596",
                "nome": "1 RELOGIO CHAMPION ABREVIADO",
                "valor": "R$ 9.999,99",
                "valorMin": 282,
                "codInterno": "454545",
                "id": 2596,
                "localEstoque": "PRATELEIRA 1",
                "exibirValor": true
            }
        }
    ]
}
```

# Using
Download de project, put all files in you server, open `./index.html` and have fun.

In your template, use this `${jsonPropertyHere}` to replace the template content with the JSON content.

To generate the PDF, create your template or add the content in `./sample/*.txt` to the `textarea` element in page, and click on replace to apply the template. After this, create your JSON file with the your data and selected then in input file, and click in rocket to generate.

# Using in external project
Fist, include all this dependencies, in this sequence, in your page.
```html
<script src="./js/jquery.min.js"></script>
<script src="./js/html2canvas.min.js"></script>
<script src="./js/jsBarcode.all.min.js"></script>
<script src="./js/jspdf.umd.min.js"></script>
<script defer type="module" src="./js/epLabelPrint.js"></script>
```

Or, in ES6, ensure the modules `jquery`, `html2canvas`, `jsBarcode`, `jspdf` is imported in your project, and import the `epLabelPrint`:
```javascript
import { epLabelPrint } from 'js/epLabelPrint';
```

Second, add the sample code to generate the PDF with your label template and JSON data.
```javascript
const template = `{your of generated HTML template here}`;
const data = `{your JSON data here}`;
const epLabelPrint = window.epLabelPrint;

epLabelPrint.printElementInPDF(
    epLabelPrint.generateElementToPrintOfString(data, template)
).then(doc => {
    window.open(doc.output('bloburl'));
}).catch(error => console.log(error));
```

# Note
The Tailwind CSS was used in this project in experimental mode.
