# graceful-exit-nodejs
Investigating graceful exit for a nodejs http server.

We want a graceful exit to
1. stop accepting requests by closing the http listener
2. wait for pending connections to finish until graceperiod is up

We're gonna test this by running a parent process that forks a http server and 1+ http clients. The number of clients depending on the test case. Forking allows for easy orchestration, sending signals and also passing arbitrary data between parent och child via ipc channels.

So the parent will start a http server, and when the server is listening, the parent will start 1+ http clients that will call the server and finally the parent will signal the server to exit (by sending sigint or sigterm that the process can catch). At this point we expect some http calls to succeed and some to fail - depending on the latency of the request and graceperiod. When the graceperiod is up there will be a forced termination of any pending requests - the equivalent of an orchestrator like k8s sending an (uncatchable) sigkill.

All tests can be run with the optional flag `DEBUG=http-graceful-shutdown` for more verbose output.

# case 1
single client pending

- graceperiod > request latency
- parent starts server and client
- client makes request to server
- parent sigterms server
- expect: server waits on pending connection

```bash
$ npm run single-client
```

```yml
parent |------------------------------0
server     |-----------x-----------0
client          |-------------0
request           |---------|
graceperiod            |-----------|
cleanup                     |------|
```

# case 2
clients refused post sigterm

- graceperiod > request latency
- parent starts server and client 1
- client 1 makes request to server
- parent sigterms server
- client 2 makes request to server
- expect: server waits on pending connection from client 1 but does not accept client 2 (connect ECONNREFUSED)

```bash
$ npm run multiple-clients
```

```yml
parent       |------------------------------0
server           |----------x-----------0
client-01            |-------------0
request-01             |---------|
client-02                   |------1
request-02                    |--X
graceperiod                 |-----------|
cleanup                          |------|
```

# case 3
graceperiod up

- graceperiod < request latency
- parent starts server and client
- client makes request to server
- parent sigterms server
- expect: server ends pending connection (socket hang up)

```bash
$ npm run timeout
```

```yml
parent       |------------------------------0
server           |----------x-----------1
client               |-------------1
request                |---------X
graceperiod                 |----|
```

# todo
- [ ] handle pending db calls
- [ ] server cleanup starts only after response sent

# license
MIT
