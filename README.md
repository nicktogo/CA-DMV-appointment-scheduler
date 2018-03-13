# DVM notifier

If you have to go to the DMV in San Francisco, it can take weeks or even months to find an appointment. But people sometimes cancel those appointments! Those cancelled appointments could be yours, if you'd like to click on the DMV site all day hoping to score one.

Hmm....repetitive clicking...through a static workflow...with a clear goal...seems like a good job for...A BOT????

Yes, a bot. A bot that will never get tired of checking the DMV webpage for you, and letting you know if it finds something within a preset number of days.

## Setup

1. Clone this repo
2. Install local dependencies

    ```
    npm install
    ```

3. Install global dependencies: casper, phantom

    ```
    npm install -g phantomjs
    npm install -g casperjs
    ```

4. Make a Twilio account / messaging service / phone number: [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
5. Make a config file

    ```
    cp config.js.example config.js
    ```

6. Write your information to the config file

6. Yes, I know that's two sixes, but it's late and I don't wanna renumber everything. You should probably just test the script at this point before getting into the cronjob stuff. Just run `dmv.sh SAN_FRANCISCO 14` (or whatever city/days into the future you care about checking) and make sure it all works.

7. Set up a cronjob to run the script

    ```
    crontab -e
    ```

    then add

    ```
    */1 * * * * cd PATH/TO/dmv-notifier/ && ./dmv.sh SAN_FRANCISCO 140 >/tmp/stdout.log 2>/tmp/stderr.log
    ```

    Common pitfall: your cron setup may or may not have PATH set up correctly. If it doesn't, you need to set PATH to include the directory where your `casperjs` cli is located. You can find this out with `which casperjs`.

    Also, keep in mind that SAN_FRANCISCO is configurable to another CA DMV (just put it in all caps and separate spaces with underscores. LA would be LOS_ANGELES, for example). Also, the number 14 is the number of days in the future that would be acceptable to you.

    A possible bin PATH might be: 

    ```
    PATH=/usr/local/bin
    ```

    Another possible bin PATH (the one that works for me, for example):

    ```
    PATH=/Users/briangerson/.nvm/versions/node/v4.3.2/bin/:/usr/bin/
    ```

8. You should be all set.

## Thank Yous
This service was heavily inspired by (and built around the foundation of) the GOES notifier built by Oliver Song which can be found at https://github.com/oliversong/goes-notifier. That's a pretty dope service as well. (Apparently it is deprecated, but there are links to working solutions available there).

## License
MIT

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
