import 'dotenv/config';
import { db } from '../lib/db/client';
import crypto from 'crypto';

// Users extracted from infoData sheet
const users = [
    {
        "name": "kamil",
        "surname": "xawier",
        "email": "kamil@example.com",
        "password": "12345",
        "birthDate": "2000-05-11",
        "uuid": "3529a8b6-9dee-43e0-a25c-f2914a2a7513"
    },
    {
        "name": "asdsad",
        "surname": "asdsad",
        "email": "asdsad@gmail.com",
        "password": "Dfb2MPnxMYmePJrL5ID1huYR",
        "birthDate": "2000-05-11",
        "uuid": "da4c0e56-d95d-42fa-b983-03177e273813"
    },
    {
        "name": "testowe",
        "surname": "testowe",
        "email": "develo123perxawierstudio@gmail.com",
        "password": "gWp6QYpbHyuJKRltQklGPxdC",
        "birthDate": "2025-12-16",
        "uuid": "85e62fb7-8b89-4579-863d-341b275310d4"
    },
    {
        "name": "TestUser",
        "surname": "December",
        "email": "testuser.dec19@example.com",
        "password": "lKbe8WeVDA/e.JSPIliE4TSOj1F",
        "birthDate": "1990-01-15",
        "uuid": "5a6e20f9-1c72-41ec-8957-f23763030579"
    },
    {
        "name": "ALOISIO",
        "surname": "MONTEIRO",
        "email": "aloisio-monteiro@hotmail.com",
        "password": "aBvOUoIjrFGuKYOKDIQkk5CVJ",
        "birthDate": "1973-06-14",
        "uuid": "df2dcfb7-3a4f-45dc-a1af-b9a6cdaf92f5"
    },
    {
        "name": "Carolina",
        "surname": "Moura",
        "email": "carolina.silva.moura@outlook.com",
        "password": "12345678Aa",
        "birthDate": "1995-10-15",
        "uuid": "d32b2a70-ee6d-4312-b2ea-6873fc6d21b2"
    },
    {
        "name": "Alexandrina",
        "surname": "Gomes",
        "email": "alexandrina.gomes2014@gmail.com",
        "password": "12345678Aa",
        "birthDate": "1978-09-01",
        "uuid": "070d81bb-bb75-4345-8c3d-db075beb19b9"
    },
    {
        "name": "Tiago",
        "surname": "Leitão",
        "email": "tiagoleitao90@gmail.com",
        "password": "12345678Aa",
        "birthDate": "2001-03-16",
        "uuid": "278c2c8c-283b-4372-a037-36924881abc2"
    },
    {
        "name": "Fabio",
        "surname": "Test",
        "email": "developerxawierstudio@gmail.com",
        "password": "12345",
        "birthDate": "1990-01-01",
        "uuid": "0fb7eae7-fa56-481e-b740-b97cf6e1d2f0"
    },
    {
        "name": "Timer",
        "surname": "Test",
        "email": "developerxawierstudio1@gmail.com",
        "password": "12345",
        "birthDate": "1990-01-01",
        "uuid": "8455c599-f711-4d63-975a-61c2b2dcae5f"
    },
    {
        "name": "fabio",
        "surname": "vercel",
        "email": "fabioptvercel@gmail.com",
        "password": "aUNj1X/sEyPuhmqy5cCLVsoeJ",
        "birthDate": "2000-05-11",
        "uuid": "a65f24f6-1578-47f3-b37c-d5ca60c1e335"
    },
    {
        "name": "test",
        "surname": "test",
        "email": "mushiskamszot@gmail.com",
        "password": "l/jkec.VNZp.ByS31R9Dr4G8iY3",
        "birthDate": "2000-05-11",
        "uuid": "0c7479a9-82fb-4f88-8c59-515f7ccd921a"
    },
    {
        "name": "Catarina",
        "surname": "Leitão",
        "email": "katarinaleitao2777@gmail.com",
        "password": "12345678Aa",
        "birthDate": "1999-12-27",
        "uuid": "8662e1ca-b830-4c55-a15d-529352f22812"
    },
    {
        "name": "Mariana",
        "surname": "Elias",
        "email": "filipamarianaelias@gmail.com",
        "password": "12345678Aa",
        "birthDate": "2002-08-25",
        "uuid": "9e2f0a02-e500-417d-a47b-8cede3f25263"
    },
    {
        "name": "Joana",
        "surname": "Pacheco",
        "email": "pachecojraquel@gmail.com",
        "password": "12345678Aa",
        "birthDate": "1994-05-12",
        "uuid": "8d8cb539-e703-4d80-b7d3-f1fa90513c0f"
    }
];

async function main() {
    console.log('🚀 Creating users from infoData...');

    for (const u of users) {
        try {
            const birthDate = new Date(u.birthDate);

            await db.user.create({
                data: {
                    id: u.uuid,
                    email: u.email.toLowerCase(),
                    name: u.name,
                    surname: u.surname,
                    password: u.password,
                    birth: birthDate,
                    phone: null,
                    trainingCredit: 0,
                    trainingsScheduled: 0,
                    debtValue: 0,
                    paid: '-',
                }
            });
            console.log(`✅ Created user: ${u.email}`);
        } catch (e: any) {
            console.error(`❌ Failed to create ${u.email}:`, e.message);
        }
    }

    console.log('\n✅ All users created!');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await db.$disconnect());
