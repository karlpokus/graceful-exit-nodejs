# graceful-exit-nodejs
Investigating graceful exit for a nodejs http server.

We want a graceful exit to
1. stop accepting requests by closing the http listener
2. wait for pending connections to finish until graceperiod is up

note: All tests can be run with the opt `DEBUG=http-graceful-shutdown` for verbose output.

# test 1
- parent starts server and client
- client makes request to server
- parent sigterms server
- expect: server waits on pending connection

```bash
$ npm run single-client
```

# test 2
- parent starts server and client 1
- client 1 makes request to server
- parent sigterms server
- client 2 makes request to server
- expect: server waits on pending connection from client 1 but does not accept client 2

```bash
$ npm run multiple-clients
```


# license
MIT
