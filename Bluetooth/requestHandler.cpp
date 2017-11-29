#include "requestHandler.h"

requestHandler::requestHandler(){
	
}

int requestHandler::handle(int user_id,int type){

//*Declare all variables*

//Variables for time check
struct tm entry = {0};
struct tm leave = {0};
string entry_string;
string leave_string;
double difference_entry;
double difference_leave;
time_t local;
time(&local);
time_t timer;
time(&timer);
struct tm* tm = localtime(&timer);

//Door controller object
doorControl controller;

//Objects for accessing MySQL database
sql::Driver *driver = get_driver_instance();
sql::Connection *con;
sql::Statement *stmt;
sql::PreparedStatement  *prep_stmt;
sql::ResultSet  *res;
bool res2;
int is_admin = 3;

//Connect to MySql Database
con = driver->connect("tcp://127.0.0.1:3306", "root", "");
stmt = con->createStatement();
stmt->execute("USE skolegas");

//Select User by ID
prep_stmt = con->prepareStatement("SELECT * FROM users WHERE id = ?");
prep_stmt->setInt(1, user_id);
res = prep_stmt->executeQuery();

//Get results from query
while(res->next()) {
    is_admin = res->getInt("is_admin");
    leave_string = res->getString("allowed_leave_time");
    entry_string = res->getString("allowed_access_time");
}


//Convert time from String in MySQL to type time_t
leave.tm_hour = stoi(leave_string.substr(0,2));   
leave.tm_min = stoi(leave_string.substr(3,2));
leave.tm_sec = 0;
leave.tm_year = tm->tm_year;
leave.tm_mon = tm->tm_mon;
leave.tm_mday = tm->tm_mday;

entry.tm_hour = stoi(entry_string.substr(0,2));   
entry.tm_min = stoi(entry_string.substr(3,2));
entry.tm_sec = 0;
entry.tm_year = tm->tm_year;
entry.tm_mon = tm->tm_mon;
entry.tm_mday = tm->tm_mday;


//Check time difference from localtime
difference_entry = difftime(mktime(tm),mktime(&entry));
difference_leave = difftime(mktime(&leave),mktime(tm));

//Print Local time and data for debugging
cout << "Local Time: " <<ctime(&local) << endl;
cout << "Diference_Entry: " << difference_entry << endl;
cout << "Difference Leave: " << difference_leave << endl;
cout << "Is admin: " << is_admin << endl;

//Check if user has permissions and if time is appropriate
if(is_admin == 1 && difference_entry > 0 && difference_leave > 0){
    controller.open();
    cout << "Door is open" <<  endl;
    prep_stmt = con->prepareStatement("INSERT INTO users_log (user_id,type,timestamp) VALUES(?,?,?)");
    prep_stmt->setInt(1, user_id);
    prep_stmt->setInt(2,type);
    prep_stmt->setString(3, ctime(&local));
    res2 = prep_stmt->execute();
    
    if(type == 1){
        prep_stmt = con->prepareStatement("UPDATE users SET is_in_room = 1 WHERE id = ?");
        prep_stmt->setInt(1, user_id);
        prep_stmt->execute();
    }else{
        prep_stmt = con->prepareStatement("UPDATE users SET is_in_room = 0 WHERE id = ?");
        prep_stmt->setInt(1, user_id);
        prep_stmt->execute(); 
    }

    return 1;

} 
else if(is_admin == 0){
    cout << "User is not an admin" << endl;
    return 0;
    
} 
else{
    cout << "User not found" << endl;
    return 2;
    
}

}