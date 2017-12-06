/* Standard C++ includes */
#include <stdlib.h>
#include <iostream>

/*
*   Include directly the different
*     headers from cppconn/ and mysql_driver.h + mysql_util.h
*       (and mysql_connection.h). This will reduce your build time!
*       */
#include "mysql_connection.h"

#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>
#include "Admin.cpp"
#include <string>

using namespace std;

int main(void) {

	cout << "Starting..." << endl;
	
		
    while(true) {
		
		int id;
		Admin admin;
		string user_name;
		int is_admin;
		string phone_number;
		string allowed_entry;
		string allowed_leave;	
        int desiredFunction;
        char cr;

        std::system("clear");

        cout << endl << "----------------------------------" << endl;
        cout << "Funções disponíveis" << endl;
        cout << "1 - Adicionar usuário" << endl;
        cout << "2 - Listar usuários" << endl;
        cout << "3 - Deletar usuário" << endl;
        cout << "4 - Modificar usuário" << endl;
        cout << "Digite a função desejada > ";
        cin >> desiredFunction;
        // remove enter from cin buffer
        cin.get(cr);

        switch (desiredFunction) {
            case 1:
            cout << "Digite o nome do usuário" << endl;
			cin >> user_name;
			cout << "Usuário é Admin? (1 para sim, 0 para não)" << endl;
			cin >> is_admin;
			cout << "Numero de telefone" << endl;
			cin >> phone_number;
			cout << "Hora para entrada (hh:mm:ss)" << endl;
			cin >> allowed_entry;
			cout << "Hora para saída (hh:mm:ss)" << endl;
			cin >> allowed_leave;
			// remove enter from cin buffer
			cin.get(cr);

			admin.add_user(user_name,is_admin,phone_number,allowed_entry,allowed_leave);
			cout << "usuário adicionado com sucesso" << endl;
			cout << endl << endl << "__ Pressione ENTER para continuar __" << endl << endl;
            cin.get(cr);
			break;

            case 2:
            admin.list_users();
            cout << endl << endl << "__ Pressione ENTER para continuar __" << endl << endl;
            cin.get(cr);
            break;

            case 3:
			cout << "Digite o id do usuário" << endl;
			cin >> id;
			// remove enter from cin buffer
			cin.get(cr);

			admin.del_user(id);
			cout << "usuário deletado com sucesso" << endl;
			cout << endl << endl << "__ Pressione ENTER para continuar __" << endl << endl;
            cin.get(cr);
            break;

            case 4:
			cout << "Digite o id do usuário" << endl;
			cin >> id;
			cout << "Usuário é Admin? (1 para sim, 0 para não)" << endl;
			cin >> is_admin;
			cout << "Hora para entrada (hh:mm:ss)" << endl;
			cin >> allowed_entry;
			cout << "Hora para saída (hh:mm:ss)" << endl;
			cin >> allowed_leave;
			// remove enter from cin buffer
			cin.get(cr);

			admin.update_user(id, is_admin, allowed_entry, allowed_leave);
			cout << "usuario atualizado" << endl;
			cout << endl << endl << "__ Pressione ENTER para continuar __" << endl << endl;
            cin.get(cr);
            break;

            default:
            break;
        }
    }

    return 0;

}
