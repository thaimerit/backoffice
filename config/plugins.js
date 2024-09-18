module.exports = ({ env }) => ({
  ckeditor: {
    enabled: true,
    config: {
      plugin: {
        // disable data-theme tag setting //
        // setAttribute:false,
        // disable strapi theme, will use default ckeditor theme //
        // strapiTheme:false,
        // styles applied to editor container (global scope) //
        // styles:`
        // .ck.ck-editor__main .ck-focused{
        //   max-height: 700px;
        // }
        // :root{
        //   --ck-color-focus-border:red;
        //   --ck-color-text:red;
        // }
        // `
      },
      editor: {
        // editor default config

        // https://ckeditor.com/docs/ckeditor5/latest/features/markdown.html
        // if you need markdown support and output set: removePlugins: [''],
        // default is
        // removePlugins: ['Markdown'],

        // https://ckeditor.com/docs/ckeditor5/latest/features/toolbar/toolbar.html
        toolbar: {
          items: [
            "bold",
            "italic",
            "fontColor",
            "underline",
            "removeFormat",
            "alignment",
            "|",
            "StrapiMediaLib",
            "sourceEditing"
          ],
        },
        // https://ckeditor.com/docs/ckeditor5/latest/features/font.html
        fontSize: {
          options: [9, 11, 13, "default", 17, 19, 21, 27, 35],
          supportAllValues: false,
        },
        fontColor: {
          columns: 5,
          documentColors: 10,
        },
        fontBackgroundColor: {
          columns: 5,
          documentColors: 10,
        },
        // https://ckeditor.com/docs/ckeditor5/latest/features/ui-language.html
        // default language: 'en',
        // https://ckeditor.com/docs/ckeditor5/latest/features/images/images-overview.html
        image: {
          resizeUnit: "%",
          resizeOptions: [
            {
              name: "resizeImage:original",
              value: null,
              icon: "original",
            },
            {
              name: "resizeImage:25",
              value: "25",
              icon: "small",
            },
            {
              name: "resizeImage:50",
              value: "50",
              icon: "medium",
            },
            {
              name: "resizeImage:75",
              value: "75",
              icon: "large",
            },
          ],
          toolbar: [
            "toggleImageCaption",
            "imageTextAlternative",
            "imageStyle:inline",
            "imageStyle:block",
            "imageStyle:side",
            "linkImage",
            "resizeImage:25",
            "resizeImage:50",
            "resizeImage:75",
            "resizeImage:original",
          ],
        },
        // https://ckeditor.com/docs/ckeditor5/latest/features/table.html
        table: {
          contentToolbar: [
            "tableColumn",
            "tableRow",
            "mergeTableCells",
            "tableCellProperties",
            "tableProperties",
            "toggleTableCaption",
          ],
        },
        // https://ckeditor.com/docs/ckeditor5/latest/features/headings.html
        heading: {
          options: [
            {
              model: "paragraph",
              title: "Paragraph",
              class: "ck-heading_paragraph",
            },
            {
              model: "heading1",
              view: "h1",
              title: "Heading 1",
              class: "ck-heading_heading1",
            },
            {
              model: "heading2",
              view: "h2",
              title: "Heading 2",
              class: "ck-heading_heading2",
            },
            {
              model: "heading3",
              view: "h3",
              title: "Heading 3",
              class: "ck-heading_heading3",
            },
            {
              model: "heading4",
              view: "h4",
              title: "Heading 4",
              class: "ck-heading_heading4",
            },
          ],
        },
        // https://ckeditor.com/docs/ckeditor5/latest/features/general-html-support.html
        // Regular expressions (/.*/  /^(p|h[2-4])$/' etc) for htmlSupport does not allowed in this config
        htmlSupport: {
          allow: [
            {
              name: "img",
              attributes: {
                sizes: true,
                loading: true,
              },
            },
          ],
        },
      },
    },
  },
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("SMTP_HOST", "smtp.example.com"),
        port: env("SMTP_PORT", 587),
        auth: {
          user: env("SMTP_USERNAME"),
          pass: env("SMTP_PASSWORD"),
        },
        // ... any custom nodemailer options
      },
      settings: {
        defaultFrom: "thaimerit@mail.extics.com",
        defaultReplyTo: "thaimerit@mail.extics.com",
      },
    },
  },
  "rest-cache": {
    config: {
      provider: {
        name: "memory",
        options: {
          max: 32767,
          maxAge: 3600,
        },
      },
      strategy: {
        contentTypes: [
          // list of Content-Types UID to cache
          "api::category.category",
          "api::product.product",
          "api::place.place",
          "api::holystick.holystick",
        ],
      },
    },
  },
  fcm: {
    enabled: true,
    resolve: "./src/plugins/fcm",
  },
  "line-notify": {
    enabled: true,
    resolve: "./src/plugins/line-notify",
  },
  menus: {
    config: {
      maxDepth: 3,
    },
  },
  'apple-auth': {
    enabled: true,
    resolve: './src/plugins/apple-auth'
  },
  'dashboard': {
    enabled: true,
    resolve: './src/plugins/dashboard'
  },
  'order-daily': {
    enabled: true,
    resolve: './src/plugins/order-daily'
  },
  'user-birthdate': {
    enabled: true,
    resolve: './src/plugins/user-birthdate'
  },
  // 'admin-dashboard': {
  //   enabled: true,
  //   resolve: './src/plugins/admin-dashboard'
  // },
});
