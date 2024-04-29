const fs = require('fs/promises');

(async() => {

  const commandFileHandler = await  fs.open("./command.txt", "r")

  commandFileHandler.on("change", changeHandler(commandFileHandler))

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

      // File Creation
      // create-file <path>
      if (command.includes(CREATE_FILE)) {
        const filePath = command.substring(CREATE_FILE.length + 1)
        createFile(filePath)
      }
    })

  }

  async function createFile(filePath) {
    let existingFileHandle;

    try {
      // if runs smoothly, then we already have the file
      existingFileHandle = await fs.open(filePath, 'r')
      return console.log(`File ${filePath} exists`)
    } catch (e) {
      // we don't have the file
      const newFileHandle = await fs.open(filePath, 'w')
      console.log(`File ${filePath} created`)
    }
    existingFileHandle.close()
  }

  // watcher...
  const watcher = await fs.watch("./command.txt")
  for await (const event of watcher) {
    if (event.eventType === 'change') {
      commandFileHandler.emit("change")
    }
  }

}) ()





