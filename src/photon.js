import { Photon } from '@generated/photon'
import { type } from 'os'
const photon = new Photon({ debug: false })

/*
async function main() {
    await photon.connect()
    const result = await photon.users.create({
        data: {
            name: '20190929_01',
            email: '20190929_01@example.com',
            password: '12345678',
            authProviders: {
                create: [
                    {
                        type: 'GOOGLE',
                        userId: 'GOOGLE_20190929_01_userId',
                        token: 'GOOGLE_20190929_01_token'
                    }
                ]
            }
        }
    })
    console.log(`result: ${JSON.stringify(result, undefined, 2)}`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await photon.disconnect()
  })
*/

export { photon as default }