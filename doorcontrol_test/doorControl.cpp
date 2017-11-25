


#include <iostream>
#include <stdlib.h>
#include <string>
#include <restclient-cpp/restclient.h>



using namespace std;


class doorControl{
public:
	doorControl();
    void open();
    void close();
};


doorControl::doorControl(){
	RestClient::init();
}

void doorControl::open(){

RestClient::Response r = RestClient::get("http://192.168.1.225/open");

}

void doorControl::close(){

RestClient::Response r = RestClient::get("http://192.168.1.225/close");

}
