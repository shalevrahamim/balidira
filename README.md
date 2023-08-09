## BaLiDira - 🏠

Architecture link: https://lucid.app/lucidchart/8e590099-7e78-4a88-85c1-67e1be41578f/edit?viewport_loc=3403%2C923%2C3581%2C1303%2C0_0&invitationId=inv_7ba11429-5bbe-4f3a-a39d-89ac3260e195

Renting an apartment can be a daunting task. From the exhaustive searches to the endless back-and-forths with agents, and then not finding what you really want. It's a draining experience, riddled with frustration.
Welcome to our experiment.

BaLiDira is our attempt to redefine apartment hunting. Our solution? Integration of Telegram Bot with apartment listings. Instead of you diving deep into web portals and agents' listings, let us bring the apartment to your chat.

Simply converse with our chatbot, describe your dream apartment (be it the size, city, number of rooms, or any other specifics), and let us do the heavy lifting. With BaLiDira, every day feels like an unveiling as you're prompted with apartments that match your criteria, right in your Telegram chat.

*This is more than just a service; it's a study. We're exploring if technology, when infused with simplicity and user-centered design, can break the shackles of traditional apartment-hunting frustrations. Your participation and feedback are vital in this transformative journey.*

### Tech Stack
- *Node.js*: Our primary backend runtime.
- *Sequelize*: ORM to manage database interactions.
- *Postgres*: Database for storing user preferences and apartment listings.

### Classes
- *Telegram*: Interacts with the Telegram bot, supplying user details and tracking various user interactions.
- *DB*: Handles all database operations, such as creating users, updating user preferences, and saving apartment listings.
- *Puppeteer*: Manages Facebook scraping for publicly available group listings.
