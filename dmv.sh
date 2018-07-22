export PATH="/usr/local/bin:$PATH" && \
casperjs --verbose --ignore-ssl-errors=true --ssl-protocol=any --officeId=$1 --days=$2 ./ghostRunner.js