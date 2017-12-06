#include <iostream>
#include <string>
#include "BTI.cpp"
#include "requestHandler.cpp"

using namespace std;

int main(){

    char disconnectString[] = "disconnect";
    char messageAuthorized[] = "Access Authorized\n";
    char messageNotFound[] = "User not found\n";
    char messageInvalid[] = "Invalid user or action\n";
    char messageNotAuthorized[] = "Access not Authorized\n";
    char messageGoodbye[] = "Goodbye!\n";

    while(1) {

        int hasError = 0;
        BTI bluetooth;

        bluetooth.connect();

        while(hasError == 0) {

            int recv_data_size, user_id, type, status;            
            char data[1024] = { 0 };

            recv_data_size = bluetooth.get_data(data);
            string received = data;

            if(recv_data_size < 0) {
                hasError = 1;
            } 
            else if (strcmp(data,disconnectString) == 0) {
                hasError = 1;
            }

            if((hasError == 0) && (recv_data_size > 0)) {
               
                try {
                    user_id = stoi(received.substr(1));
                    type = stoi(received.substr(0,1));
                } catch (const std::exception& ex) {
                    bluetooth.send_data(messageInvalid,sizeof(messageInvalid));
                    hasError = 1;
                }
            }

            if (hasError == 0) {
        
                requestHandler handler;
                status = handler.handle( user_id , type);

                if (type == ENTERING_ROOM) {
                    if (status == 1){
                        bluetooth.send_data(messageAuthorized,sizeof(messageAuthorized));
                    } else if (status > 1){
                        bluetooth.send_data(messageNotFound,sizeof(messageNotFound));
                    } else {
                        bluetooth.send_data(messageNotAuthorized,sizeof(messageNotAuthorized));
                    }    
                } 
                else if (type == LEAVING_ROOM) {
                    if (status == 1){
                        bluetooth.send_data(messageGoodbye,sizeof(messageGoodbye));
                    } else if (status > 1){
                        bluetooth.send_data(messageNotFound,sizeof(messageNotFound));
                    } else {
                        bluetooth.send_data(messageNotAuthorized,sizeof(messageNotAuthorized));
                    }   
                }    
            }
        }

        bluetooth.disconnect();
        
    }

}
