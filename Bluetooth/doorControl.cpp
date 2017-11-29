#include "doorControl.h"

doorControl::doorControl(){
	RestClient::init();
}

void doorControl::open(){

RestClient::Response r = RestClient::get("http://192.168.0.37/open");

}

void doorControl::close(){

RestClient::Response r = RestClient::get("http://192.168.0.37/close");

}
