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
	void add_user(string user_name, int is_admin, int phone_number, string allowed_entry, string allowed_leave);
	void del_user(int id);
	void list_users();
	void update_user(int id, int is_admin, string allowed_entry, string allowed_leave);
};


Admin::Admin(){
	
}

void Admin::update_user(int id, int is_admin, string allowed_entry, string allowed_leave){

sql::Driver *driver = get_driver_instance();
sql::Connection *con;
sql::Statement *stmt;
sql::PreparedStatement  *prep_stmt;


con = driver->connect("tcp://127.0.0.1:3306", "root", "");
stmt = con->createStatement();
stmt->execute("USE skolegas");

prep_stmt = con->prepareStatement("UPDATE users SET is_admin = ?, allowed_access_time = ?, allowed_leave_time = ? WHERE id = ?");

prep_stmt->setInt(1, is_admin);
prep_stmt->setString(2, allowed_entry);
prep_stmt->setString(3, allowed_leave);
prep_stmt->setInt(4, id);
prep_stmt->execute();

delete prep_stmt;
delete con;
delete stmt;


}

void Admin::add_user(string user_name, int is_admin, int phone_number = 0, string allowed_entry = "00:00:00", string allowed_leave = "23:59:59"){

sql::Driver *driver = get_driver_instance();
sql::Connection *con;
sql::Statement *stmt;
sql::PreparedStatement  *prep_stmt;


con = driver->connect("tcp://127.0.0.1:3306", "root", "");
stmt = con->createStatement();
stmt->execute("USE skolegas");



prep_stmt = con->prepareStatement("INSERT INTO users( user_name, is_admin, phone_number, allowed_access_time, allowed_leave_time) VALUES (?,?,?,?,?)");
prep_stmt->setString(1, user_name);
prep_stmt->setInt(2, is_admin);
prep_stmt->setInt(3, phone_number);
prep_stmt->setString(4, allowed_entry);
prep_stmt->setString(5, allowed_leave);
prep_stmt->execute();

delete prep_stmt;
delete con;
delete stmt;
}

void Admin::list_users(){
sql::Driver *driver = get_driver_instance();
sql::Connection *con;
sql::Statement *stmt;
sql::ResultSet *res;



con = driver->connect("tcp://127.0.0.1:3306", "root", "");
stmt = con->createStatement();
stmt->execute("USE skolegas");

res = stmt->executeQuery("SELECT * FROM users");

sql::ResultSetMetaData *res_meta = res -> getMetaData();
int columns = res_meta -> getColumnCount();
cout << setw(15);
cout << "id" << "         user_name"<< "       is_admin" << "      phone_number" << "  allowed_entry_time" << "  allowed_exit_time" << endl;
//Loop for each row
while (res->next()) {
/* Access column data by index, 1-indexed*/
	for (int i = 1; i <= columns; i++) {
	  cout << setw(15);
      cout << res->getString(i) << "  " ;
    }
    cout << endl;
  }

}

void Admin::del_user(int id){

sql::Driver *driver = get_driver_instance();
sql::Connection *con;
sql::Statement *stmt;
sql::PreparedStatement  *prep_stmt;


con = driver->connect("tcp://127.0.0.1:3306", "root", "");
stmt = con->createStatement();
stmt->execute("USE skolegas");



prep_stmt = con->prepareStatement("DELETE FROM users WHERE id = ?");
prep_stmt->setInt(1, id);
prep_stmt->execute();

delete prep_stmt;
delete con;
delete stmt;


}
