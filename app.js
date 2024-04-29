const fs = require('fs/promises');

(async() => {

  const commandFileHandler = await  fs.open("./command.txt", "r")
  await commandFileHandler.chmod(0o644)

  // Entire Application | TL DR
  commandFileHandler.on("change", FileManager(commandFileHandler))

  // watcher...
  const watcher = await fs.watch("./command.txt")
  for await (const event of watcher) {
    if (event.eventType === 'change') {
      commandFileHandler.emit("change")
    }
  }

  function FileManager(commandFileHandler) {
    console.log("FileManager started...")
    return (async () => {
      // Commands
      const CREATE_FILE = "create-file"
      const DELETE_FILE = "delete-file"
      const RENAME_FILE = "rename-file"
      const COPY_FILE = "copy-file"
      const MOVE_FILE = "move-file"
      const WRITE_IN_FILE = "write"

      // File properties and settings
      const size = (await commandFileHandler.stat()).size
      const buffer = Buffer.alloc(size)
      const offset = 0;
      const length = buffer.byteLength;
      const position = 0;

      const primaryPathIndex = 1
      const newPathIndex = 2

      // Filling the file into buffer from beginning(0) to the end(buffer.byteLength).
      await commandFileHandler.read(buffer, offset, length, position)

      // Decoder
      const command = buffer.toString('utf8')

      // Creating file
      // create-file <path>
      if (command.includes(CREATE_FILE)) {
        const filePath = command.split(" ")[primaryPathIndex]
        await createFile(filePath)
      }

      // Deleting file
      // delete-file <path>
      if (command.includes(DELETE_FILE)) {
        const filePath = command.split(" ")[primaryPathIndex]
        await deleteFile(filePath)
      }

      // Renaming file
      // rename-file <oldPath> <newPath>
      if (command.includes(RENAME_FILE)) {
        const [oldPath, newPath] = [command.split(" ")[primaryPathIndex], command.split(" ")[newPathIndex]]
        await renameFile(oldPath, newPath)
      }

      // Copying File
      // copy-file <oldPath> <newPath>
      if (command.includes(COPY_FILE)) {
        const [oldPath, newPath] = [command.split(" ")[primaryPathIndex], command.split(" ")[newPathIndex]]
        await copyFile(oldPath, newPath)
      }

      // Moving File
      // move-file <oldPath> <newPath>
      if (command.includes(MOVE_FILE)) {
        const [oldPath, newPath] = [command.split(" ")[primaryPathIndex], command.split(" ")[newPathIndex]]
        await moveFile(oldPath, newPath)
      }

      // Writing in File
      if (command.includes(WRITE_IN_FILE)) {
        const filePath = command.split(" ")[primaryPathIndex]
        const content = command.split(" ").slice(newPathIndex).toString()
        await writeInFile(filePath, content)
      }
      console.log('-------')
    })

  }

  async function createFile(filePath) {
    try {
      // if runs smoothly, then we already have the file
      const existingFileHandle = await fs.open(filePath, 'r')
      if (existingFileHandle) await existingFileHandle.close()

      console.log(`File ${filePath} exists`)
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

      console.log(`File ${filePath} successfully deleted`)

    } catch (e) {

      // file does not exist
      console.log(`${e}`)
    }
  }

  async function renameFile(oldPath, newPath) {
    try {

      // if file exists, it will be renamed
      const existingFileHandle = await fs.open(oldPath, 'w')
      await fs.rename(oldPath, newPath)
      await existingFileHandle.close()

      console.log(`File ${oldPath} successfully renamed to ${newPath}`)

    } catch (e) {

      // file does not exist
      console.log(`${e}`)
    }
  }

  async function copyFile(oldPath, newPath) {
    try {

      // if file exists, it will be renamed
      const existingFileHandle = await fs.open(oldPath, 'w')
      await fs.copyFile(oldPath, newPath)
      await existingFileHandle.close()

      console.log(`File ${oldPath} successfully copied as ${newPath}`)

    } catch (e) {

      // file does not exist
      console.log(`${e}`)
    }
  }

  async function moveFile(oldPath, newPath) {
    try {

      // if file exists, it will be renamed
      const existingFileHandle = await fs.open(oldPath, 'w')
      await fs.rename(oldPath, newPath)
      await fs.unlink(oldPath)
      await existingFileHandle.close()
      console.log(`File ${oldPath} successfully moved as ${newPath}`)

    } catch (e) {

      // file does not exist
      console.log(`${e}`)
    }
  }

  async function writeInFile(path, content) {
    try {

      // if file exists, it will be renamed
      const existingFileHandle = await fs.open(path, 'w')
      await fs.writeFile(path, content)
      await existingFileHandle.close()
      console.log(`Content successfully written to ${path}`)

    } catch (e) {

      // file does not exist
      console.log(`${e}`)
    }
  }
}) ()