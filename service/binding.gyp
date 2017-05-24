{
    "targets": [
        {
            "target_name": "dht",
            "sources": [
                "./src/sensor/WiringPiSetup.cpp",

                "./src/sensor/Time.cpp",
                "./src/sensor/Process.cpp",

                "./src/sensor/Dht/Dht.cpp",
                "./src/sensor/Dht/DhtAddon.cpp"
            ],
            "libraries": [ "-lwiringPi" ]
        }
    ]
}