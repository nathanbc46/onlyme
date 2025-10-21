import sharp from 'sharp'
//import { parse } from 'path'
import { createWriteStream, promises as fs, existsSync } from 'fs'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import { join } from 'path';

export default defineEventHandler(async (event) => {
    const files = await readMultipartFormData(event)
    const user = await getCurrentUser(event)
    
    if (!user) {
        return
    }

    if (!files || files.length === 0) {
        throw new Error('No file uploaded')
    }

    // เอาไฟล์แรกออกมา
    const file = files[0]

    // ✅ เช็คว่าเป็นรูปภาพด้วย MIME type
    if (!file.type?.startsWith('image/')) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Only image uploads are allowed'
        })
    }

    // ✅ เพิ่มความปลอดภัย เช็คด้วย sharp
    try {
        const meta = await sharp(file.data).metadata()
        if (!meta.format) {
            throw new Error('Invalid image file')
        }

        const output = `./public/uploads/avatar/${Date.now()}-${file.filename}.png`
        const urlOutput = `/uploads/avatar/${Date.now()}-${file.filename}.png`

        const writeStream = createWriteStream(output)
        const resizedStream = sharp().resize(200, 200).toFormat('png')
        const ReadStream = Readable.from(file.data)


        await pipeline(ReadStream, resizedStream, writeStream)

        //remove original file
        if (user.image !== null && user.image !== undefined) {
            try {
                const filePath = join(process.cwd(), 'public', user.image);
                console.log(filePath)
                if (existsSync(filePath)) {
                    await fs.unlink(filePath);
                }
            } catch (err) {
                return { success: false, message: (err as Error).message };
            }
        }

        return { url: urlOutput, message: 'Image uploaded successfully' }

    } catch (error) {
        throw createError({
            statusCode: 400,
            statusMessage: (error as Error).message
        })
    }

})