import * as XLSX from 'xlsx'
import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function importXlsxToDb(filePath: string) {
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

    for (const row of data) {
        await prisma.sessionHistories.create({
            data: {
                utm_content: row['utm_content'] || '',
                utm_medium: row['utm_medium'] || '',
                utm_source: row['utm_source'] || '',
                utm_campaign: row['utm_campaign'] || '',
                createdAt: new Date(row['createdAt']) || '',
                sessionId: row['sessionId'] || '',
            }
        })
    }
    await prisma.$disconnect()
}

importXlsxToDb("database.xlsx")
