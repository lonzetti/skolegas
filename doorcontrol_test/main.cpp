/* Standard C++ includes */
#include <stdlib.h>
#include <iostream>

/*
*   Include directly the different
*     headers from cppconn/ and mysql_driver.h + mysql_util.h
*       (and mysql_connection.h). This will reduce your build time!
*       */
#include <string>
#include "doorControl.cpp"
#include <restclient-cpp/restclient.h>

using namespace std;

int main(void) {

doorControl controle;
controle.open();


	

}
