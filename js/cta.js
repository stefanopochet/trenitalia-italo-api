// @todo: check speed
var cta = {
	version : "0.3.1",
	config : {
		apifierRequestUrl : "https://api.apifier.com/v1/c7YgpqfkyeKtE4XyN/crawlers/{crawlerNamespace}/execute?token={crawlerToken}",
		apifierCheckRequestUrl : "https://api.apifier.com/v1/execs/{runId}",
		apifierGetResultsUrl : "https://api.apifier.com/v1/execs/{runId}/results",
		providers : [
			{code: "TRENITALIA", crawlerNamespace : "Trenitalia", crawlerToken : "HZzY4mrdTn6saBogfomBn8YDG"},
			{code: "ITALO", crawlerNamespace : "Italo%20Treno", crawlerToken : "8PoEydCKck5ric9hQ8DpjKxhS"}
		],
		italoSearchUrlPrefix : "https://biglietti.italotreno.it/Booking_Acquisto_Ricerca.aspx[POST]"
	},
	settings : {
		writeLogs : false
	},
	getProviderInfo : function( providerCode ){
		for( var i in cta.config.providers ){
			if( cta.config.providers[i].code == providerCode ){
				return cta.config.providers[i];
			}
		}
		return false;
	},
	italoStations : [
			{stationCode:"BC_",trenitaliaCorrispondence:"Bologna Centrale"},
			{stationCode:"BSC",trenitaliaCorrispondence:"Brescia"},
			{stationCode:"F__",trenitaliaCorrispondence:"Ferrara"},
			{stationCode:"SMN",trenitaliaCorrispondence:"Firenze S. M. Novella"},
			{stationCode:"MI0",trenitaliaCorrispondence:"Milano ( Tutte Le Stazioni )"},
			{stationCode:"MC_",trenitaliaCorrispondence:"Milano Centrale"},
			{stationCode:"RRO",trenitaliaCorrispondence:"Rho-Fiera Milano"},
			{stationCode:"RG_",trenitaliaCorrispondence:"Milano Rogoredo"},
			{stationCode:"NAC",trenitaliaCorrispondence:"Napoli Centrale"},
			{stationCode:"PD_",trenitaliaCorrispondence:"Padova"},
			{stationCode:"AAV",trenitaliaCorrispondence:"Reggio Emilia AV"},
			{stationCode:"RM0",trenitaliaCorrispondence:"Roma ( Tutte Le Stazioni )"},
			{stationCode:"RMT",trenitaliaCorrispondence:"Roma Termini"},
			{stationCode:"RTB",trenitaliaCorrispondence:"Roma Tiburtina"},
			{stationCode:"SAL",trenitaliaCorrispondence:"Salerno"},
			{stationCode:"TOP",trenitaliaCorrispondence:"Torino Porta Nuova"},
			{stationCode:"OUE",trenitaliaCorrispondence:"Torino Porta Susa"},,
			{stationCode:"VEM",trenitaliaCorrispondence:"Venezia Mestre"},,
			{stationCode:"VSL",trenitaliaCorrispondence:"Venezia S.Lucia"},,
			{stationCode:"VPN",trenitaliaCorrispondence:"Verona Porta Nuova"},
		],
	log : function( data ){
		if( cta.settings.writeLogs ){
			console.log( "CTAJS V" + cta.version + "", data );
		}
	},
	getItaloStationName : function( trenitaliaStationName ){
		// console.log("Getting italo station name from trenitalia " + trenitaliaStationName );
		for( var i in cta.italoStations ){
			if( cta.italoStations[i].trenitaliaCorrispondence == trenitaliaStationName){
				return cta.italoStations[i].stationCode;
			}
		}
		return false;
	},
	generateUniqueId : function() {
	  function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000)
	      .toString(16)
	      .substring(1);
	  }
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	    s4() + '-' + s4() + s4() + s4();
	},
	requests : [],
	getRequest : function( requestId ) {
		for( var i in cta.requests ){
			if( cta.requests[i].requestId == requestId ){
				return cta.requests[i];
			}
		}
		return false;
	},
	deleteRequest : function( requestId ){
		for( var i in cta.requests ){
			if( cta.requests[i].requestId == requestId ){
				cta.requests.splice( i, 1);
				return true;
			}
		}
		throw "Unable to find request while deleting request";
	},
	getRequestStatus : function( requestId, provider){
		for( var i in cta.requests ){
			if( cta.requests[i].requestId == requestId ){
				for( var j in cta.requests[i].status ){
					if( cta.requests[i].status[j].provider == provider ){
						return cta.requests[i].status[j];
					}
				}
			}
		}
		throw "Unable to find request while getting run status";
	},
	setRequestRunId : function( requestId, provider, runId ){
		for( var i in cta.requests ){
			if( cta.requests[i].requestId == requestId ){
				// cta.log( requestId + " requestId found");
				for( var j in cta.requests[i].status ){
					// cta.log("going to check status provider " + cta.requests[i].status[j].provider);
					if( cta.requests[i].status[j].provider == provider ){
						//cta.log(provider + " provider found");
						cta.requests[i].status[j].apifierRunId = runId;
						return true;
					}
				}
			}
		}
		throw "Unable to find request while setting run id";
	},
	setRequestChecksCounter : function( requestId, provider, checksCounter ){
		for( var i in cta.requests ){
			if( cta.requests[i].requestId == requestId ){
				for( var j in cta.requests[i].status ){
					if( cta.requests[i].status[j].provider == provider ){
						cta.requests[i].status[j].checksCounter = checksCounter;
						return true;
					}
				}
			}
		}
		throw "Unable to find request while setting checks counter";
	},
	setRequestResults : function( requestId, provider, results ){
		for( var i in cta.requests ){
			if( cta.requests[i].requestId == requestId ){
				for( var j in cta.requests[i].status ){
					if( cta.requests[i].status[j].provider == provider ){
						cta.requests[i].status[j].results = results;
						return true;
					}
				}
			}
		}
		throw "Unable to find request while setting results";
	},
	requestTrainInfo : function( provider, from, to, departureDate, departureTime, numberOfAdults, numberOfKids, resultCallback, settings ){
		// settings dataValidation
		if( settings !== undefined && settings.writeLogs !== undefined && settings.writeLogs == true ){
			cta.settings.writeLogs = true;
		}
		cta.log("Request script started");
		cta.log("Input validation started");

		if( provider != "TRENITALIA" && provider != "ITALO" && provider != "BOTH" ){
			return { "requestResult" : "error", errorType : "Input Provider invalid", "errorDescription" : "" };
		}
		var fromValid = false;
		var toValid = false;
		if( provider == "TRENITALIA" ){
			fromValid = true;
			toValid = true;
		} else {
			cta.log("Starting check Italo Stations", cta.italoStations);
			for( var i in cta.italoStations ){
				cta.log("Checking from station", from, "Against station ", cta.italoStations[i].trenitaliaCorrispondence );
				if( from == cta.italoStations[i].trenitaliaCorrispondence ){
					fromValid = true;
				}
				if( to == cta.italoStations[i].trenitaliaCorrispondence ){
					toValid = true;
				}
			}
		}
		if( ! fromValid  ){
			return { requestResult : "error", errorType : "From Station Input invalid for Italo request", "errorDescription" : "" };
		}
		if( ! toValid  ){
			return { requestResult : "error", errorType : "From Station Input invalid for Italo request", "errorDescription" : "" };
		}
		var dateFormatReg = /^\d{2}([./-])\d{2}\1\d{4}$/;
		if( ! departureDate.match( dateFormatReg ) ){
			return { requestResult : "error", errorType : "Departure date format invalid" , "errorDescription" : "" };
		}
		departureTime = parseInt(departureTime);
		if( ! Number.isInteger(departureTime) || departureTime < 0 || departureTime > 24 ){
			return { requestResult : "error", errorType : "Departure time format invalid" , "errorDescription" : "" };
		}
		numberOfAdults = parseInt(numberOfAdults);
		if( ! Number.isInteger(numberOfAdults) || numberOfAdults < 1 || numberOfAdults > 5 ){
			return { requestResult : "error", errorType : "Number of adults format invalid" , "errorDescription" : "" };
		}
		numberOfKids = parseInt(numberOfKids);
		if( ! Number.isInteger(numberOfKids) || numberOfKids < 0 || numberOfKids > 5 ){
			return { requestResult : "error", errorType : "Number of kids format invalid" , "errorDescription" : "" };
		}
		var getType = {};
 		if( ! resultCallback || ! getType.toString.call(resultCallback) === '[object Function]' ){
 			return { requestResult : "error", errorType : "Result Callback is not a function", "errorDescription" : "" };
 		}
 		cta.log("Input validation OK");

 		// generate actual request object
 		cta.log("Building request object");
 		var requestId = cta.generateUniqueId();
 		cta.requests.push( {
			requestId : requestId,
			provider : provider,
			input :{
				from : from,
				to : to,
				departureDate : departureDate,
				departureTime : departureTime,
				numberOfAdults : numberOfAdults,
				numberOfKids : numberOfKids
			},
			status : [
				{
					provider : "TRENITALIA",
					apifierRunId : null,
					checksCounter : 0,
					results : null
				},
				{
					provider : "ITALO",
					apifierRunId : null,
					checksCounter : 0,
					results : null
				},
			],
			resultCallback : resultCallback
		});
		// send the apifier requests
		cta.sendRequests( requestId );
		return { "requestResult" : "OK" };
 	},
 	sendRequests: function( requestId ){
 		// actually send the apifier requests
 		cta.log("Actually sending requests");
 		var request = cta.getRequest( requestId );
		if( ! request ){
			throw "Request not found while sending Apifier request";
		}
		if( request.provider == "BOTH" ){
 			cta.sendSingleRequest( requestId, "TRENITALIA" );
 			cta.sendSingleRequest( requestId, "ITALO" );
 		} else {
 			cta.sendSingleRequest( requestId, request.provider );
 		};
	},
	sendSingleRequest : function( requestId, provider ){
		cta.log("Actually sending provider " + provider + " request");
		var request = cta.getRequest( requestId );
		if( ! request ){
			throw "Request not found while sending Apifier request";
		}
		var contentType, customData;
		if( provider == "TRENITALIA"){
			// Build Trenitalia Request
			contentType = "application/x-www-form-urlencoded; charset=UTF-8";
			customData = { 
				customData : JSON.stringify({
					"from": request.input.from,
					"to": request.input.to,
					"depart_date": request.input.departureDate,
					"depart_time": request.input.departureTime,
					"num_adults": request.input.numberOfAdults,
					"num_kids": request.input.numberOfKids
				})
			}
		} else if ( provider == "ITALO"){
			// Build Italo Request
			contentType = "application/json";
			var italoSearchUrl = "";
			var departureDay = request.input.departureDate.substr(0,request.input.departureDate.indexOf("-"));
			var departureMonthYear = request.input.departureDate.substr(request.input.departureDate.indexOf("-")+1);
			var departureHoursBegin = request.input.departureTime;
			var departureHoursEnd = departureHoursBegin + 6;
			var numAdults = request.input.numberOfAdults;
			var numChildrens = request.input.numberOfKids;
			var numInfants = 0;
			var numSeniors = 0;
			console.log("Departure day", departureDay , "departure month/year", departureMonthYear, "departureTime", departureHoursBegin)
			
			italoSearchUrl += "BookingRicercaRestylingBookingAcquistoRicercaView$RadioButtonMarketStructure=OneWay";
			italoSearchUrl += "&BookingRicercaRestylingBookingAcquistoRicercaView$TextBoxMarketOrigin1=" + cta.getItaloStationName( request.input.from );
			italoSearchUrl += "&BookingRicercaRestylingBookingAcquistoRicercaView$TextBoxMarketDestination1=" + cta.getItaloStationName( request.input.to );
			italoSearchUrl += "&BookingRicercaRestylingBookingAcquistoRicercaView$DropDownListMarketDay1=" + departureDay;
			italoSearchUrl += "&BookingRicercaRestylingBookingAcquistoRicercaView$DropDownListMarketMonth1=" + departureMonthYear;
			italoSearchUrl += "&BookingRicercaRestylingBookingAcquistoRicercaView$DropDownDepartureTimeHoursBegin_1=" + departureHoursBegin;
			italoSearchUrl += "&BookingRicercaRestylingBookingAcquistoRicercaView$DropDownDepartureTimeHoursEnd_1=" + departureHoursEnd;
			italoSearchUrl += "&BookingRicercaRestylingBookingAcquistoRicercaView$DropDownListPassengerType_ADT=" + numAdults;
			italoSearchUrl += "&BookingRicercaRestylingBookingAcquistoRicercaView$DropDownListPassengerType_SNR=" + numChildrens;
			italoSearchUrl += "&BookingRicercaRestylingBookingAcquistoRicercaView$InfantTextBox=" + numInfants;
			italoSearchUrl += "&BookingRicercaRestylingBookingAcquistoRicercaView$DropDownListPassengerType_CHD=" + numSeniors;
			italoSearchUrl += "&promocode=";
			italoSearchUrl += "&BookingRicercaRestylingBookingAcquistoRicercaView$DropDownListSearchBy=columnView";
			italoSearchUrl += "&BookingRicercaRestylingBookingAcquistoRicercaView$DropDownListFareTypes=ST";
			italoSearchUrl += "&__EVENTTARGET=BookingRicercaRestylingBookingAcquistoRicercaView$ButtonSubmit";
			italoSearchUrl += "&__EVENTARGUMENT=";
			customData = JSON.stringify({ startUrls : [{
				"key": "START",
				"value": cta.config.italoSearchUrlPrefix + encodeURI(italoSearchUrl)
			}]})
		}
		$.ajax({
			method: "POST",
			contentType : contentType,
			url: cta.config.apifierRequestUrl.replace("{crawlerNamespace}",cta.getProviderInfo(provider).crawlerNamespace).replace("{crawlerToken}",cta.getProviderInfo(provider).crawlerToken),
			data: customData,
			requestId : requestId
		}).done(function( returnData ) {
			// cta.log( this.requestId );
			// cta.log( provider );
			// cta.log(returnData);
			cta.setRequestRunId( this.requestId, provider, returnData._id );
			//cta.log("Calling check results");
			cta.checkResults( this.requestId, provider );
		});
	},
	checkAllResultsReady : function( requestId ){
		// get request and status info
		cta.log("Going to check if all results are ready for request id " + requestId);
		var request = cta.getRequest( requestId );
		if( ! requestId ){
			throw "Request not found while checking all request results ready";
		}
		var allRequestsReady = true;
		for( var i in request.status ){
			if( request.status[i].apifierRunId !=null && request.status[i].results == null ){
				// a request is still running
				allRequestsReady = false;
			}
		}
		if( allRequestsReady ){
			var data = [];
			for( i in request.status ){
				if( request.status[i].apifierRunId !=null ){
					data.push( 
						{ 
							provider : request.status[i].provider,
							apifierRunId : request.status[i].apifierRunId,
							numberOfChecks : request.status[i].checksCounter,
							results : request.status[i].results
						} 
					);
				}
			}
			var returnData = {
				result : "success",
				data : data
			}
			request.resultCallback( returnData );
			cta.deleteRequest( requestId );
		}
	},
	checkResults : function( requestId, provider ){
		// get request and status info
		var request = cta.getRequest( requestId );
		if( ! requestId ){
			throw "Request not found while checking request results ready";
		}
		var status = cta.getRequestStatus( requestId, provider );

		cta.log("Checking results for request Id " + requestId + ", provider " + status.provider + ", apifierRunId " + status.apifierRunId + ", #check number " + (status.checksCounter + 1) );
		cta.setRequestChecksCounter( requestId, provider, status.checksCounter + 1);

		$.ajax({
			url:  cta.config.apifierCheckRequestUrl.replace("{runId}",status.apifierRunId),
			requestId : requestId,
			provider : provider
		}).done(function( returnData ){
			var request = cta.getRequest( this.requestId );
				if( ! requestId ){
					throw "Request not found while checking request results ready";
				}
			var status = cta.getRequestStatus( request.requestId, this.provider );
			if( returnData == undefined || returnData.status == undefined ){
				throw( "Check Return data from Apifier invalid");
			}
			if( returnData.status == "RUNNING"){
				cta.checkResults( this.requestId, this.provider );
			} else if( returnData.status == "SUCCEEDED"){
				// @todo, translate Italo trains
				cta.log("Results are ready for request Id " + request.requestId + ", provider " + status.provider + ", apifierRunId " + status.apifierRunId);
				$.ajax({
					url: cta.config.apifierGetResultsUrl.replace("{runId}",status.apifierRunId),
					requestId : requestId,
					provider : provider
				}).done(function( returnData ){
					var request = cta.getRequest( this.requestId );
					if( ! requestId ){
						throw "Request not found while checking request results ready";
					}
					var status = cta.getRequestStatus( request.requestId, this.provider );
					if( returnData == undefined || ! Array.isArray(returnData) ){
						throw( "Result return data from Apifier invalid");
					}
					cta.log("Results returned for for request Id " + requestId + ", provider " + status.provider + ", apifierRunId " + status.apifierRunId);
					var resultsPageCrawled = false;
					$.each( returnData, function( urlIndex, urlElement ){
						// for Trenitalia results are in pageResults with given label "results"
						if( status.provider == "ITALO" || status.provider == "TRENITALIA" && urlElement.label == "results" ){
							// for Italo I have to add a dummy trainType and offer and have to translate stations
							if( status.provider == "ITALO" || status.provider == "TRENITALIA" && urlElement.label == "results" ){
								for( j in urlElement.pageFunctionResult ){
									urlElement.pageFunctionResult[j].offer = null;
									urlElement.pageFunctionResult[j].trainType = null;
								}
							}
							cta.setRequestResults( requestId, provider, urlElement.pageFunctionResult);
							cta.checkAllResultsReady( requestId );
							resultsPageCrawled = true;
						}
					});
					if( resultsPageCrawled == false) {
						cta.log("Error, Results void returned from Apifier");
						cta.log(returnData);
						throw("Apifier results return error, please check logs");
					}
				});
			} else if( returnData.status == "FAILED"){
				throw( "Crawler failed, please check input data and if error persists contact CTA support");
			} else {
				throw( "Unrecognized crawler run status, please check logs");
			}
		});
	}
}