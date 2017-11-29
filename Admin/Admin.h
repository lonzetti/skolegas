#include <iostream>
#include <stdlib.h>
#include <string>
#include "mysql_connection.h"
#include <cppconn/resultset_metadata.h>
#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>
#include <cppconn/prepared_statement.h>
#include <ctime>
#include <iomanip>

using namespace std;

class Admin{
public:
	Admin();
	void add_user(string user_name, int is_admin, string phone_number, string allowed_entry, string allowed_leave);
	void del_user(int id);
	void list_users();
	void update_user(int id, int is_admin, string allowed_entry, string allowed_leave);
};