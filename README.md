# Caf.js

Co-design cloud assistants with your web app and IoT devices.

See https://www.cafjs.com

## Caf.js library to access Bluetooth LEGO devices

Interact with Bluetooth LEGO hubs from an IoT device, or a browser using the Web Bluetooth API (Chrome).

This plugin is a thin wrapper around the amazing `nathankellenicki/node-poweredup` package.

## Dependencies Warning

To eliminate expensive dependencies for apps in the workspace that do not need `caf_iot_lego`, the package `node-poweredup@^8.0.5` is declared as optional dependency even though it is always needed.

Applications that depend on `caf_iot_lego` should also include this dependency in package.json as a standard dependency.


## API

    lib/proxy_iot_lego.js

## Configuration Example

### iot.json
```
    {
            "module": "caf_iot_lego#plug_iot",
            "name": "lego",
            "description": "Access BLE LEGO services.",
            "env" : {
                "maxRetries" : "$._.env.maxRetries",
                "retryDelay" : "$._.env.retryDelay",
                "manuallyAttached": "process.env.MANUALLY_ATTACHED||[]"
            },
            "components" : [
                {
                    "module": "caf_iot_lego#proxy_iot",
                    "name": "proxy",
                    "description": "Proxy to access LEGO services.",
                    "env" : {
                    }
                }
            ]
    }
```
## Debugging Web Bluetooth API on Chrome

The Web Bluetooth API is only available with `https` or a `localhost` address, and it will not work with our usual `http://*.localtest.me` local address.

It is also blocked for cross-origin iframes, and the app needs to be in its own tab. This is the reason all the examples (see `caf_hellolego`) spawn a new page when Bluetooth activates.

In the rest of this discussion we are referring to the URL of this new page, e.g., `http://root-hellolego.localtest.me/...`.

In Chrome you can have subdomains in localhost, e.g., `root-hellolego.localhost`, and they correctly resolve to the local interface. When running in local mode, i.e., after `cafjs run`, the application is always exposed on local port 3003.

Therefore, a hack to get Web Bluetooth API to work in local mode is as follows:

-Run your app locally as usual, spawn the window with Bluetooth code. It will have an address of the form `http://root-<app>.localtest.me/...&token=...`

-Replace `localtest.me` by `localhost:3003` in the Chrome address bar and reload. Leave the rest of the URL as it is, e.g.:
```
    http://root-<app>.localhost:3003/... &token=...
```
And now Web Bluetooth is working!
