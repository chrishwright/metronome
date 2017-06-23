This application was built as a tool to assist with music lessons.  The 'tap tempo' feature isn't available on 
most metronomes and comes in handy.  The 'Song Tempo Lookup' feature is helpful when finding songs with a 
desired tempo.

To install:

1) Node must first be installed on the server.  Once installed, navigate to the metronome directory and type: npm start

2) If using the 'Song Tempo Lookup' feature, you will need to have a Spotify developer id (base 64 encrypted).

3) To add your key, create a '.env' file in the metronome root and enter the following:

    process.env['ENCRYPTED_KEY'] = "your base 64 encrypted key here"

To run the application:

1) Click the ‘Start/Stop’ button

2) From here, you can choose several options.  You may click:

3) ‘Tap Tempo’ which will prompt you to ‘Keep Tapping.’  This will time out if you don’t keep pressing the button.

4) You can click the images of the notes, they will change the subdivision of the beat.

5) You can adjust the tempo by using the input selector or tapping the ‘tap tempo’ button.

6) If using the 'Song Tempo Lookup' function, refer to the installation instructions.  Then click the ‘Song Tempo Lookup’ button.  
From here you can follow the instructions and input data.  Submit will return requested results.

7) Choose a different style for the metronome by selecting from the drop down.  
