const fs = require("fs")
const path = require("path")

function getCopy(source, plugin) {
  let extensionDocPath = path.join(__dirname, "src", "extensions", plugin, source)
  let pluginDocPath = path.join(__dirname, "node_modules", "@strapi", "plugin-" + plugin, source)

  console.log({
    extensionDocPath,
    pluginDocPath
  })


  let files = pluginDocPath.split("/")
  files.pop()

  if (!fs.existsSync(files.join("/"))) {
    fs.mkdirSync(files.join("/"), {
      recursive: true
    })
  }

  fs.copyFileSync(extensionDocPath, pluginDocPath)
}

function copyStrapi(source) {
  let extensionDocPath = path.join(__dirname, "src", source)
  let pluginDocPath = path.join(__dirname, "node_modules", "@strapi", source)

  console.log({
    extensionDocPath,
    pluginDocPath
  })

  let files = pluginDocPath.split("/")
  files.pop()

  if (!fs.existsSync(files.join("/"))) {
    fs.mkdirSync(files.join("/"), {
      recursive: true
    })
  }

  fs.copyFileSync(extensionDocPath, pluginDocPath)
}

getCopy("server/services/documentation.js", "documentation")

getCopy("documentation/content-api.yaml", "users-permissions")
getCopy("server/controllers/auth.js", "users-permissions")
getCopy("server/controllers/user.js", "users-permissions")
getCopy("server/routes/content-api/auth.js", "users-permissions")
getCopy("server/services/providers.js", "users-permissions")
getCopy("server/services/providers-registry.js", "users-permissions")
getCopy("server/services/user.js", "users-permissions")

copyStrapi("admin/admin/src/pages/Admin/index.js")
copyStrapi("admin/admin/src/pages/HomePage/HomeHeader.js")
copyStrapi("admin/admin/src/pages/HomePage/index.js")
copyStrapi("admin/admin/src/pages/SettingsPage/pages/ApplicationInfosPage/index.js")
copyStrapi("admin/admin/src/content-manager/pages/App/LeftMenu/index.js")
copyStrapi("admin/admin/src/components/UnauthenticatedLogo/index.js")

copyStrapi("admin/server/controllers/authenticated-user.js")
getCopy("server/controllers/content-types.js", "content-manager")
getCopy("server/controllers/collection-types.js", "content-manager")
getCopy("server/controllers/relations.js", "content-manager")

