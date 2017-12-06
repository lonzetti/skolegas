#include "BTI.h"


BTI::BTI(){

    //Set all parameters for connection
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

void BTI::send_data(char* message, int size){
    write(client, message,size);
    cout << "Response Sent: " << message << endl;
}

void BTI::connect(){
    // put socket into listening mode
    listen(s, 1);

    // accept one connection
    client = accept(s, (struct sockaddr *)&rem_addr, &opt);
    ba2str( &rem_addr.rc_bdaddr, buf );
    cout << "Connection accepted" << endl;
    memset(buf, 0, sizeof(buf));

    pollingFd.fd = client; 
    pollingFd.events = POLLIN;
}

//Receive data being sent
int BTI::get_data(char* data){

    int ret;

    ret = poll(&pollingFd, 1, TIMEOUT * 1000);
    switch (ret) {
        case -1:
            // Error
            cout << "ERROR" << endl;
            strcpy(data, "");
            bytes_read = -1;
            break;
        case 0:
            // Timeout 
            cout << "CONNECTION TIMEOUT" << endl;
            strcpy(data, "");
            bytes_read = -1;
            break;
        default:
            cout << "RET " << ret << endl;
            bytes_read = read(client, data, 1024);
            cout << "Arquivo recebido " << bytes_read << endl;
            break;
    }

    return bytes_read;
        
}

void BTI::disconnect(){
    close(client);
    close(s);
}







