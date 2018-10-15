# NOTE

PLEASE DON'T ABUSE THIS PROGRAM. USE IT PROPERLY AND LEAVE APPOINTMENTS TO PEOPLE WHO ALSO NEED THEM.
DO NOT SCHEDULE TO MANY APPOINTMENTS. CANCEL ADDITIONAL APPOINTMENTS IF YOU FINISH YOUR STAFF AT DMV.

CA DMV introduced Google Recaptcha to avoid being polled by program.
This repo bypass the recaptcha and help make drive test appointment.

`master` branch of this repo was used to make appointment for written test and it does not have the code change to bypass recaptcha. I only add the bypassing to `behind_the_wheel_appointment` branch. Please refer to `behind_the_wheel_appointment` if you want to use `master` to schedule written test. You are more than welcome to open PR for the changes. 

This repo is modified from [brianpgerson/dmv-appointment-helper](https://github.com/brianpgerson/dmv-appointment-helper). Thanks briangerson's contribution.

Things are changed:
- replace twilio with telegram bot.
    - Please refer to https://www.forsomedefinition.com/automation/creating-telegram-bot-notifications/ about how to create bot for notifications.
- export PATH in `dmv.sh`.
- add steps to actually schedule an appointment when the timing fits.
- bypass Google Recaptcha.

# DMV notifier

If you have to go to the DMV in San Francisco, it can take weeks or even months to find an appointment. But people sometimes cancel those appointments! Those cancelled appointments could be yours, if you'd like to click on the DMV site all day hoping to score one.

Hmm....repetitive clicking...through a static workflow...with a clear goal...seems like a good job for...A BOT????

Yes, a bot. A bot that will never get tired of checking the DMV webpage for you, and letting you know if it finds something within a preset number of days. If you are even slighly comfortable using the command line, this will be that bot for you. 

## Setup

1. Clone this repo
2. Install local dependencies

    ```
    cd path/to/CA-DMV-appointment-scheduler
    npm install
    ```

3. Install global dependencies: casper, phantom

    ```
    npm install -g phantomjs
    npm install -g casperjs
    ```
4. Make a config file

    ```
    cp config.js.example config.js
    ```

5. Write your information to the config file

6. You should probably just test the script at this point before getting into the cronjob stuff. 
Just run `dmv.sh 632 40` (or whatever office/days into the future you care about checking) and make sure it all works.
You can find the officeId in the dropdown menu's HTML content. For example, 632 is Santa Clara DMV. See [Office-ID.md](Office-ID.md) for other DMVs.  
The number 40 is the number of days in the future that would be acceptable to you.

7. Set up a cronjob to run the script

    ```
    crontab -e
    ```

    then add

    ```
    */1 * * * * cd PATH/TO/CA-DMV-appointment-scheduler/ && ./dmv.sh 632 40 >/tmp/stdout.log 2>/tmp/stderr.log
    ```
    The first line means try to schedule an appointment at Santa Clara office for the next 40 days every minute.
    
    Look up cron rules to find out more about what the first cryptic characters mean.

    Common pitfall: your cron setup may or may not have PATH set up correctly. If it doesn't, you need to set PATH to include the directory where your `casperjs` cli is located. You can find this out with `which casperjs`.
    
    A possible bin PATH might be: 

    ```
    PATH=/usr/local/bin
    ```
    
    I already set the PATH in `dmv.sh` for you. This PATH works for me.
    If it is not the same as your output of `which casperjs`, go head and change the `dmv.sh` 

    Another possible bin PATH (the one that works for original author, for example):

    ```
    PATH=/Users/briangerson/.nvm/versions/node/v4.3.2/bin/:/usr/bin/
    ```

8. You should be all set. If the bot finds an appointment within the timeframe you specified, it'll schedule the appointment and send a telegram message to you. The timeframe is [1, days).


## Thank Yous
This service was heavily inspired by (and built around the foundation of) the GOES notifier built by Oliver Song which can be found at https://github.com/oliversong/goes-notifier. That's a pretty dope service as well. (Apparently it is deprecated, but there are links to working solutions available there).

## License
MIT

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
