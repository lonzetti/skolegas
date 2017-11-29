#include <iostream>
#include <stdlib.h>
#include <string>
#include <time.h>


#include "mysql_connection.h"
#include <cppconn/resultset_metadata.h>

#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>
#include <cppconn/prepared_statement.h>
#include "doorControl.cpp"

#include <stdio.h>
#include <sstream>
#include <iomanip>


using namespace std;

class requestHandler{
public:
	requestHandler();
	int handle(int user_id, int type);
};