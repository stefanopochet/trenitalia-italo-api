# trenitalia-italo-api

This is an unofficial Javascript API for Trenitalia and Italo (the two major italian railways company) train tickets search.

Given the required search parameters the API will search on Trenitalia and/or Italo website for train tickets and return available trains with given time/fare/train type and more.

This API is actually a web crwaler of Italo and Trenitalia, so response it's pretty slow (It usually takes 8 seconds for Italo and 14 seconds for Trenitalia/Both). However in the future I might develop a faster and more reliable service (please see License and Limits).

# Example HTML Implementation
Please check the following URL for a working HTML implementation of this API:
https://cdn.rawgit.com/stefanopochet/trenitalia-italo-api/a2bdddc0e5edd0fb32fb9c78f323ab7c31f46f32/usage_example.html

# Requirements
This API is based on jQuery (tested with version 3.2.1), so make sure to include jQuery in your page before including the Trenitalia-Italo-API.
```
<script src="https://code.jquery.com/jquery-3.2.1.min.js" crossorigin="anonymous"></script>
```
# Installation
Include the js/cta.js javascript file:
```
<script src="https://cdn.rawgit.com/stefanopochet/trenitalia-italo-api/a2bdddc0e5edd0fb32fb9c78f323ab7c31f46f32/js/cta.js"></script>
```

# Usage
Simply use the cta.requestTrainInfo method to make a train info request.
```
cta.requestTrainInfo( provider, from, to, departureDate, departureTime, numberOfAdults, numberOfKids, resultCallback, settings );
```
### Example:
Following is an example request:
```
cta.requestTrainInfo( "BOTH", "Napoli Centrale", "Roma Termini", "19-05-2017", 15, 1, 0, function( results ){console.log(results)
}, {writeLogs : true } );
```

### Returns
The cta.requestTrainInfo method will return a requestResult object, if all the request input were OK the requestResult parameter will be "OK", otherwise it will be "Error" and the "errorType" parameter will provide description about the given error.
Example successfull response:
``` 
{
  "requestResult" : "OK/Error",
  "errorType" : "Description of the error"
}
```

### Parameters
Following is an explanation of the meaning and the format of the cta.requestTrainInfo method parameters

##### provider
The provider to search for train tickets, if BOTH the API will search on both providers. One of "ITALO", "TRENITALIA" and "BOTH". 
##### from 
A valid station start as displayed on Trenitalia website. Please see Trenitalia public website or https://cdn.rawgit.com/stefanopochet/trenitalia-italo-api/55e5821b/trenitalia_train_stations.json for a valid list of stations. For ITALO and BOTH providers please still use the station name in the Trenitalia format (e.g "Milano Rog" becomes "Milano Rogoredo" and "Roma (Tutte)" become "Roma ( Tutte Le Stazioni )" )
#### to 
A valid station start as displayed on Trenitalia website. Please see Trenitalia public website or https://cdn.rawgit.com/stefanopochet/trenitalia-italo-api/55e5821b/trenitalia_train_stations.json for a valid list of stations. For ITALO and BOTH providers please still use the station name in the Trenitalia format (e.g "Milano Rog" becomes "Milano Rogoredo" and "Roma (Tutte)" become "Roma ( Tutte Le Stazioni )" ).
#### departureDate
Departure date in dd-mm-yyyy format. E.g. "15-07-2017" will be July 15th, 2017.
#### departureTime 
Departure time as an Integer number 0-24. E.g. "4" is 4 AM, "17" will be 5 PM. 
#### numberOfAdults 
Number of adults as an Integer number 1-5
#### numberOfKids 
Number of kids as an Integer number 0-5
#### resultCallback(resultData) 
A callback function that will be called at the end of the crawling execution. The resultCallback function will send result data as a single parameter. See next paragraph for results data format.
#### settings
A setting json object with a writeLogs parameter. E.g. { writeLogs : true }. If the writeLog parameter is true logs about the execution will be printed out on the Javascript consolle.

## Result Data format
Result Data object sent to resultCallback will have the following format:
```
{
  result : string, data : [{ // an array with the results from each provider, e.g. "success"
  provider : string // the provider for which results are returned
  apifierRunId : string // crawler unique run identifier
  numberOfChecks : integer,
  results : [ // array of results
  { 
    finish: string, //time the train arrives
    length string, // trip duration
    offer : string, // type of ticket offer, available only for Trenitalia
    start : string, // time the train starts
    startingPrice : string, // ticket starting price
    stationFinish : string, // arrival station
    stationStart : string, // starting station
    trainType : string // train number, available only for Trenitalia  
}]}
```

# Licence and Limits
I wrote this API for my own needs, using https://www.apifier.com/ web crawler, and decided to publish the API to the public.
In the future I might develop a more structured service, with very fast responses (milliseconds instead of the currents 7-15 seconds) with support and quick updates to sudden Trenitalia/Italo website changes. Ideally I would charge some money from this service.
Meanwhile you are free to use this Javascript API for any purpose, in any way you wish (commercial or non-commercial). 
Be aware that I might drop support, limit usage or change the behaviour at anytime.
If you are going to use the API, or if you have anyway any feedback, I will be happy if you drop me an email at stefanopochet@gmail.com. If you do so I will keep you updated about any future change to the API.
