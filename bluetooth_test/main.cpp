#include <iostream>
#include "BTI.cpp"
#include <string>

using namespace std;



int main(){

char data[1024] = { 0 };

BTI bluetooth;
bluetooth.connect();

bluetooth.get_data(data);

 

cout << data << endl;

}
