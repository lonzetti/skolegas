
#include <stdio.h>
#include <unistd.h>
#include <sys/socket.h>
#include <bluetooth/bluetooth.h>
#include <bluetooth/rfcomm.h>
#include <string.h>
#include <iostream>
using namespace std;


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
    void send_data(char* message, int size);

};