import sharp from 'sharp'
//import { parse } from 'path'
import { createWriteStream, promises as fs, existsSync } from 'fs'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import { join } from 'path';

export default defineEventHandler(async (event) => {
    try {
        // อ่านข้อมูลที่ส่งมาจาก FormData
        const formData = await readMultipartFormData(event)
        const user = await getCurrentUser(event)

        if (!user) {
           throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
        }

        // แยกค่าที่ต้องการ
        const file = formData?.find(f => f.name === 'file')
        const oldImage = formData?.find(f => f.name === 'oldImage')

        const oldImageUrl = oldImage?.data?.toString() // แปลงเป็น string

        if (!file) {
            throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
        }

        // ✅ เช็คว่าเป็นรูปภาพด้วย MIME type
        if (!file.type?.startsWith('image/')) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Only image uploads are allowed'
            })
        }

        // ✅ เพิ่มความปลอดภัย เช็คด้วย sharp

        const meta = await sharp(file.data).metadata()
        if (!meta.format) {
            throw new Error('Invalid image file')
        }

        const output = `./public/uploads/avatar/${Date.now()}-${file.filename}.png`
        const urlOutput = `/uploads/avatar/${Date.now()}-${file.filename}.png`

        const writeStream = createWriteStream(output)
        const resizedStream = sharp().resize(200, 200).toFormat('png')
        const ReadStream = Readable.from(file.data)

        console.log(urlOutput)


        await pipeline(ReadStream, resizedStream, writeStream)

        //remove original file
        // if (user.image !== null && user.image !== undefined && user.image !== oldImageUrl) {
        //     try {
        //         const filePath = join(process.cwd(), 'public', user.image);
        //         console.log(' Image Path ',filePath)
        //         if (existsSync(filePath)) {
        //             await fs.unlink(filePath);
        //         }
        //     } catch (err) {
        //         return { success: false, message: (err as Error).message };
        //     }
        // } else {
            //remove original file of id
            //console.log(' Old Image Path : ',oldImageUrl)
            if (oldImageUrl !== null && oldImageUrl !== undefined && oldImageUrl !== '') {
                try {
                    const filePath = join(process.cwd(), 'public', oldImageUrl);
                    //console.log(' Old Image Path ',filePath)
                    if (existsSync(filePath)) {
                        await fs.unlink(filePath);
                    }
                } catch (err) {
                    throw createError({ statusCode: 400, statusMessage: (err as Error).message })
                    //return { success: false, message: (err as Error).message };
                }


            }
        // }

        return { url: urlOutput, message: 'Image uploaded successfully' }

    } catch (error) {
        throw createError({
            statusCode: 400,
            statusMessage: (error as Error).message
        })
    }
})