const fs = require('fs/promises');

(async() => {

  const commandFileHandler = await  fs.open("./command.txt", "r")

  commandFileHandler.on("change", changeHandler(commandFileHandler))

  // watcher...
  const watcher = await fs.watch("./command.txt")
  for await (const event of watcher) {
    if (event.eventType === 'change') {
      commandFileHandler.emit("change")
    }
  }

  function changeHandler(commandFileHandler) {
    return (async () => {
      // Commands
      const CREATE_FILE = "create-file"
      const DELETE_FILE = "delete-file"
      const RENAME_FILE = "rename-file"
      const COPY_FILE = "copy-file"
      const MOVE_FILE = "move-file"

      // File properties and settings
      const size = (await commandFileHandler.stat()).size
      const buffer = Buffer.alloc(size)
      const offset = 0;
      const length = buffer.byteLength;
      const position = 0;

      // Filling the file into buffer from beginning(0) to the end(buffer.byteLength).
      await commandFileHandler.read(buffer, offset, length, position)

      // Decoder
      const command = buffer.toString('utf8')

      // Creating file
      // create-file <path>
      if (command.includes(CREATE_FILE)) {
        const filePath = command.substring(CREATE_FILE.length).split(" ")
        await createFile(filePath)
      }

      // Deleting file
      if (command.includes(DELETE_FILE)) {
        const filePath = command.substring(DELETE_FILE.length).split(" ")
        await deleteFile(filePath)
      }

      // Renaming file
      if (command.includes(RENAME_FILE)) {
        const [oldPath, newPath] = command.substring(RENAME_FILE.length).split(" ")
        await fs.rename(oldPath, newPath)
      }

      // Copying File
      if (command.includes(COPY_FILE)) {
        const [oldPath, newPath] = command.substring(COPY_FILE.length).split(" ")
        await fs.copyFile(oldPath, newPath)
      }

      // Moving File
      if (command.includes(MOVE_FILE)) {
        const [oldPath, newPath] = command.substring(MOVE_FILE.length).split(" ")
        await fs.rename(oldPath, newPath)
      }

    })

  }

  async function createFile(filePath) {
    try {

      // if runs smoothly, then we already have the file
      const existingFileHandle = await fs.open(filePath, 'r')
      if (existingFileHandle) await existingFileHandle.close()

      return console.log(`File ${filePath} exists`)
    } catch (e) {

      // we don't have the file
      const newFileHandle = await fs.open(filePath, 'w')
      console.log(`File ${filePath} successfully created`)

      await newFileHandle.close()
    }
  }

  async function deleteFile(filePath) {
    try {

      // if file exists, it will be deleted
      const existingFileHandle = await fs.open(filePath, 'w')
      await fs.unlink(filePath)
      await existingFileHandle.close()

      return console.log(`File ${filePath} successfully deleted`)

    } catch (e) {

      // file does not exist
      console.log(`File ${filePath} not exists`)
    }
  }
}) ()





