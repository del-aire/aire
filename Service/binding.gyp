{
    "targets": [
        {
            "target_name": "dht",
            "sources": [
                "./src/Sensor/WiringPiSetup.cpp",

                "./src/Sensor/Time.cpp",
                "./src/Sensor/Process.cpp",

                "./src/Sensor/Dht/Dht.cpp",
                "./src/Sensor/Dht/DhtAddon.cpp"
            ],
            "libraries": [ "-lwiringPi" ]
        }
    ]
}