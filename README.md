This application was built as a tool to assist with music lessons.  The 'tap tempo' feature isn't available on 
most metronomes and comes in handy.  The 'Song Tempo Lookup' feature is helpful when finding songs with a 
desired tempo.

To install:

1) Serve the application directory from a web server and navigate to the root index.html page in your browser.

2) If using the 'Song Tempo Lookup' feature, you will need to have node.js installed on the server, and a Spotify developer id (base 64 encrypted).

3) To add your key, create a 'env.js' file on the web root and enter the following:

    process.env['ENCRYPTED_KEY'] = "your base 64 encrypted key here"

4) With Node installed, type 'node server.js' to start the Node server (this also requires a Spotify developer account) and then browse the app as described in step #1.

To run the application:

1) Click the ‘Start/Stop’ button

2) From here, you can choose several options.  You may click:

3) ‘Tap Tempo’ which will prompt you to ‘Keep Tapping.’  This will time out if you don’t keep pressing the button.

4) You can click the images of the notes, they will change the subdivision of the beat.

5) You can adjust the tempo by using the input selector or tapping the ‘tap tempo’ button.

6) If you have a Spotify developer account, you can enable it by plugging in your encrypted key in the 'env.js' file. Then click the ‘Song Tempo Lookup’ button.  From here you can follow the instructions and input data.  Submit will return requested results.

7) Choose a different style for the metronome by selecting from the drop down.  
