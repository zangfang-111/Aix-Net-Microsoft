@aix/cli
========
This package is a comman line interface that mocks Telegram webhook,
and can simulate the dialog from the terminal.
Then only thing being mock here is Telegram interface, the rest of services
are being used as usual.

Run the program *from the repository root* to have `nodemon` watching and reloading the program.
```
yarn cli
```

This package requires node esm module so you'll have to run it with
```
node -r esm bin/run
```
This will start the bot and will prompt you to choose one of the Traders in the database.

Additional you can pass two flags
```
-t telegramId
```
To skip picking a trader from database.
And
```
node -r esm bin/run -l
```
to enable moleculer logs.

