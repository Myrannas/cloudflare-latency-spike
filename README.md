# Latency Spike Reproducible Case

This repository contains a minimally reproducible example of a latency spike 
issue I have observed for Durable Objects. In this latency spike it appears that
a single socket will block for some period of time (up to a second) in both directions.

This manifests as the following:
* The affected socket sees a range of messages appear all at once with high latency
* Other sockets would see normal message delivery for all sockets except the affected socket

## How to setup

1. Build and deploy the server 
   1. `cd server` 
   2. `yarn`
   3. `yarn deploy --new-class DurableObject`
   4. Copy the URL from the deployment
2. Build and run the profiler
   1. `cd client`
   2. `yarn`
   3. `yarn profile $URL` - where `$URL` is the URL from your deployment
   4. `yarn process`

The profile has two outputs:

* `output/*.csv` - a set of csv files for each socket. Each row consists
of the id of the client from which it was received, the latency (in ms)
between being sent and being received and the sequence number (a monotonically 
increasing number for that client)
* `results.csv` - percentile results by socket (p50, p99, p99.9, p99.99)

## Finding a latency spike

* Run the profiler for several minutes (I've found around 5 minutes to be sufficient)
* Examine the results.csv and look for the highest latency percentile. Copy this value 
and look at the associated `output/*.csv` file to find this entry, there should be a spike around this time.
