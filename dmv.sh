export PATH="/usr/local/bin:$PATH" && \
casperjs --verbose --ignore-ssl-errors=true --ssl-protocol=any --city=$1 --days=$2 ./ghostRunner.js