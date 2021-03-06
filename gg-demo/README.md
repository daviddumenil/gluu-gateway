# Gluu Gateway UMA demo app

### 1. Parties

![UMA Overview](./gg-demo-overview-diagram-uma.png)

### 2. Flow
![Flow chart](./flow.png)

### 3. RS Configuration

RS configuration can be done either via REST calls or via Gluu Gateway Konga
web interface.

#### REST Configuration
1. Resource configuration (Kong API configuration)
````
curl -X POST http://gg.example.com:8001/apis
    --data "name=demo_api"
    --data "hosts=demo_host"
    --data "upstream_url=https://jsonplaceholder.typicode.com/comments"
````

2. Configuration of OAuth plugin

````
curl -X POST http://gg.example.com:8001/apis/demo_api/plugins
    --data "name=gluu-oauth2-client-auth"
    --data "config.op_server=https://ce-gluu.example.com"
    --data "config.oxd_http_url=https://localhost:8443"

````

3. Securing RS with UMA

````
curl -X POST --url http://gg.example.com:8001/apis/demo_api/plugins/
    --data "name=gluu-oauth2-rs"
    --data "config.oxd_host=https://localhost:8443"
    --data "config.uma_server_host=https://ce-gluu.example.com"
    --data "config.protection_document=[ { \"path\": \"<YOUR_PATH>\", \"conditions\": [ { \"httpMethods\": [ \"GET\" ], \"scope_expression\": {
    \"rule\": { \"and\": [ { \"var\": 0 } ] }, \"data\": [ \"http://photoz.example.com/dev/actions/view\" ] } } ] } ]"`
````

protection_document (pretty printed)
```json
[
  {
    "path": "<YOUR_PATH>",
    "conditions": [
      {
        "httpMethods": [
          "GET"
        ],
        "scope_expression": {
          "rule": {
            "and": [
              {
                "var": 0
              }
            ]
          },
          "data": [
            "<YOUR_SCOPE>"
          ]
        }
      }
    ]
  }
]
```
From the last call you get oxd_id, client_id and client_secret

#### Gluu Gateway GUI configuration
1. Resource configuration (Kong API configuration)
* Enter https://gg.example.com:1338/#!/apis
* Click "Add new API"
* Fill required fields

2. Configuration of oAuth plugin
* Click edit icon of created API
* Click plugins button in left menu
* Add new plugin
* Select custom
* Click plus icon in Gluu oauth2 client auth plugin

3. Securing RS with UMA
* Click security button in API list
* Fill UMA resource fields
* Update configuration

### 4. UMA client registration
UMA client registraion can be done either via REST calls or via GluuGateway GUI

#### REST Configuration
4. Register consumer
````
curl -X POST http://gg.example.com:8001/consumers/
    --data "username=uma_client"
````
5. Register UMA credentials
````
curl -X POST http://gg.example.com:8001/consumers/uma_client/gluu-oauth2-client-auth/
    --data name="uma_consumer_cred"
    --data op_host="ce-gluu.example.com"
    --data oxd_http_url="https://localhost:8443"
    --data uma_mode=true
````
From the last call you get oxd_id, client_id and client_secret
#### Gluu Gateway GUI configuration
4. Register consumer
* Enter https://gg.example.com:1338/#!/consumers
* Click create consumer
* Fill new consumer form

5. Register UMA credentials
* Click on created consumer
* Click on credentials
* Select OAUTH2
* Click Create Credentials
* Select UMA Mode in Credentials form
* Save credentials


### 5. Call UMA protected API
6. LogIn Consumer
 ````
 curl -X POST https://gg.example:8443/get-client-token
    --Header "Content-Type: application/json"
    --data '{"oxd_id":"<YOUR_CONSUMER_OXD_ID>", "client_id":"<YOUR_CONSUMER_ID>",
    "client_secret":"<YOUR_CONSUMER_SECRET>", "op_host":"<YOUR_OP_HOST>","scope":[<YOUR_SCOPES>]}'
 ````
 From this call you get Consumer accessToken

7. Get resource ticket
  ````
  curl -X GET http://gg.example.com:8000/<YOUR_PATH>
      --Header "Host: <YOUR_HOST>"
````
 From this call you get ticket in WWW-Authenticate header

8. Get RPT token
  ````
  curl -X POST https://gg.example.com:8443/uma-rp-get-rpt
      --Header "Authorization: Bearer <CONSUMER_TOKEN>"
      --Header "Content-Type: application/json"
      --data '{"oxd_id": "<YOUR_CONSUMER_OXD_ID>","ticket":"<YOUR_TICKET>","scope":"[<YOUR_SCOPE>]"}'
````
From this call you get accesstoken (RPT)

9. Call UMA protected API
  ````
  curl -X GET http://gg.example.com:8000/<YOUR_PATH>
      --Header "Authorization: Bearer <YOUR_RPT>"
      --Header "Host: <YOUR_HOST>"
````

### 6. UMA flow with claims gathering
7.1. Prerequisites
* UMA scope with Authorization Policy
![alt text](uma_scope.png "Logo Title Text 1")
* Enabled UMA RPT Polices & UMA Claims Gathering
![alt text](scripts.png "Logo Title Text 1")
* Register RS with correct scope

7.2. Getting need_info ticket
  ````
  curl -X POST https://gg.example.com:8443/uma-rp-get-rpt
      --Header "Authorization: Bearer <CONSUMER_TOKEN>"
      --Header "Content-Type: application/json"
      --data '{"oxd_id": "<YOUR_CONSUMER_OXD_ID>","ticket":"<YOUR_TICKET>","scope":[<YOUR_SCOPE>]}'
````
From this call you get need_info ticket and claims gathering url.
You have to add your claims redirect uri as a url query parameter.
You may need to add your claims redirect url to your client configuration in CE.

7.3. Claims gathering returns ticket

Continue to 8.


### 7. Demo

Demo is prepared as python CGI script. You need to put it in some CGI enabled web server. Script is divided into 4 parts:
* demo-client.py - main script
* calls.py - REST calls
* config.py - custom configuration
* display.py - printing functions
y
By default, UMA flow is executed.

If you want to execute UMA with claims gathering flow, add `claim=true` parameter in your url.
