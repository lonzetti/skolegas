#include "doorControl.h"

doorControl::doorControl(){
	RestClient::init();
}

void doorControl::open(){

	RestClient::Response r = RestClient::get("http://192.168.1.225/open");

}

void doorControl::close(){

	RestClient::Response r = RestClient::get("http://192.168.1.225/close");

}
