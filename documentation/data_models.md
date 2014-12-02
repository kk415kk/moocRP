[Back to README](../README.md)

Data Models
================

## HarvardX
The schema of the HarvardX data model is:
time,secs_to_next,actor,verb,object_name,object_type,result,meta,ip,event,event_type,page,agent

The data is stored in a CSV format, so one can use the ```csv``` function in d3.js to read in the data in a visualization.

* _time_: the time of the action
* _secs_to_next_: the number of seconds to the next actor
* _actor_: who is performing the action
* _verb_: the action being performed
* _object_name_: the object that the action is being performed on
* _result_:
* _meta_:
* _ip_:
* _event_:
* _event_type_:
* _page_:
* _agent_:

_Sample Entry_:
```
2014-01-23T07:48:43.123460+00:00,5.462487,applevo,page_view,Course Info,tab_name,,,1.2.3.4,"{""POST"": {}, ""GET"": {}}",/courses/University/Course/info,,"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.77 Safari/537.36"
```

