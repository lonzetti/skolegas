#include <stdio.h>
#include <unistd.h>
#include <sys/socket.h>
#include <bluetooth/bluetooth.h>
#include <bluetooth/rfcomm.h>
#include <string.h>
#include <iostream>
using namespace std;
//Bluetooth Interface

class BTI{
protected:
    struct sockaddr_rc loc_addr , rem_addr;
    bdaddr_t my_bdaddr_any = {0, 0, 0, 0, 0, 0};
    char buf[1024];
    int s, client, bytes_read;
    socklen_t opt;
public:
    BTI();
    void connect();
    void get_data(char* data);
    void disconnect();

};

BTI::BTI(){
    loc_addr = { 0 } ;
    rem_addr = { 0 };
    buf[1024] = { 0 };
    socklen_t opt = sizeof(rem_addr);

    s = socket(AF_BLUETOOTH, SOCK_STREAM, BTPROTO_RFCOMM);

    loc_addr.rc_family = AF_BLUETOOTH;
    loc_addr.rc_bdaddr = my_bdaddr_any ;
    loc_addr.rc_channel = (uint8_t) 1;
    bind(s, (struct sockaddr *)&loc_addr, sizeof(loc_addr));

}

void BTI::connect(){
        // put socket into listening mode
        listen(s, 1);

        // accept one connection
        client = accept(s, (struct sockaddr *)&rem_addr, &opt);

        ba2str( &rem_addr.rc_bdaddr, buf );
        cout << "Connection accepted" << endl;
        memset(buf, 0, sizeof(buf));
}

void BTI::get_data(char* data){


        bytes_read = read(client, data, 1024);
        cout << "Arquivo recebido" << endl;
        
}

void BTI::disconnect(){
    close(client);
    close(s);
}







/*

int main(int argc, char **argv)
{
    struct sockaddr_rc loc_addr = { 0 }, rem_addr = { 0 };
    char buf[1024] = { 0 };
    char disconnectString[] = "disconnect";
    char openString[] = "open";
    int s, client, bytes_read;
    socklen_t opt = sizeof(rem_addr);

    // allocate socket
    s = socket(AF_BLUETOOTH, SOCK_STREAM, BTPROTO_RFCOMM);

    // bind socket to port 1 of the first available 
    // local bluetooth adapter
    loc_addr.rc_family = AF_BLUETOOTH;
    loc_addr.rc_bdaddr = *BDADDR_ANY;
    loc_addr.rc_channel = (uint8_t) 1;
    bind(s, (struct sockaddr *)&loc_addr, sizeof(loc_addr));

    while(1) {

        // put socket into listening mode
        listen(s, 1);

        // accept one connection
        client = accept(s, (struct sockaddr *)&rem_addr, &opt);

        ba2str( &rem_addr.rc_bdaddr, buf );
        fprintf(stderr, "accepted connection from %s\n", buf);
        memset(buf, 0, sizeof(buf));

        // read data from the client
        while(1) {
            bytes_read = read(client, buf, sizeof(buf));
            if( bytes_read > 0 ) {
                printf("received [%s]\n", buf);
            }
            
            if(strcmp(buf, disconnectString) == 0) {
                break;
            }

            if(strcmp(buf, openString) == 0) {
                printf("door opened \n");
            }
        }
        
        printf("client disconnected\n");
        // close connection
        close(client);
    }

    close(s);
    return 0;
}

*/