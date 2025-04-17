#!/usr/bin/env bashio

if (bashio::config.has_value 'mqtt.broker'); then
  export MQTT_BROKER=$(bashio::config "mqtt.broker")
fi
if (bashio::config.has_value 'echonet.target_network'); then
  export ECHONET_TARGET_NETWORK=$(bashio::config "echonet.target_network")
fi


echo "Running custom entrypoint script for addon..."
npm run start:built
