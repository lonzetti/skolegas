#include <iostream>
#include "BTI.cpp"
#include <string>
#include "requestHandler.cpp"

using namespace std;



int main(){

    char data[1024] = { 0 };
    char disconnectString[] = "disconnect";
    int user_id;
    int type;
    int status;
    char testMessage[] = "test\n";
    char messageAuthorized[] = "Access Authorized\n";
    char messageNotFound[] = "User not found\n";
    char messageNotAuthorized[] = "Access not Authorized\n";
    int size;

    while(1) {

        BTI bluetooth;

        bluetooth.connect();

        while(1) {

            bluetooth.get_data(data);
            cout << data << endl;
            string received = data;

            if (strcmp(data,disconnectString) == 0) {
                break;
            }

            user_id = stoi(received.substr(1));
            type = stoi(received.substr(0,1));

            requestHandler handler;
            status = handler.handle( user_id , type);

            if (status == 1){
                bluetooth.send_data(messageAuthorized,sizeof(messageAuthorized));
            } else if (status > 1){
                bluetooth.send_data(messageNotFound,sizeof(messageNotFound));
            } else {
                bluetooth.send_data(messageNotAuthorized,sizeof(messageNotAuthorized));
            }
        }

        bluetooth.disconnect();
        
    }

}
