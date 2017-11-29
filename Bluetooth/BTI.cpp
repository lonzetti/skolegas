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

void BTI::send_data(char*    message, int size){
    write(client, message,size);
    cout << "Response Sent" << endl;
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

//Receive data being sent
void BTI::get_data(char* data){

        bytes_read = read(client, data, 1024);
        cout << "Arquivo recebido" << endl;
        
}

void BTI::disconnect(){
    close(client);
    close(s);
}







