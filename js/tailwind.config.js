getTailwindConfig = () => {
    return {
        corePlugins: {
        preflight: false,
      },
        theme: {
            fontFamily: {
                sans: ['Roboto', 'sans-serif'],
                serif: ['Merriweather', 'serif'],
            }
        }
    };
}
getTailwindConfig();