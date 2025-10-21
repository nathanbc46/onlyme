export default defineAppConfig({
  ui: {
    // colors: {
    //   primary: 'blue',
    //   secondary: 'gray'
    // },
    toaster: {
      defaultVariants : {
        position: 'top-right'
      }
    },
    button: {
      slots: {
        base: 'cursor-pointer'
      }
    }
  }
})