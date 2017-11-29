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

	/*try {
		sql::Driver *driver;
		sql::Connection *con;
		sql::Statement *stmt;

		/* Create a connection */
		/*driver = get_driver_instance();
		con = driver->connect("tcp://127.0.0.1:3306", "root", ""); //IP Address, user name, password

		stmt = con->createStatement();
		stmt->execute("DROP DATABASE IF EXISTS  test_db"); //drop if 'test_db' exists
		stmt->execute("CREATE DATABASE test_db");// create 'test_db' database

		stmt->execute("USE test_db"); //set current database as test_db
		stmt->execute("DROP TABLE IF EXISTS test"); //drop if 'test' table exists
		stmt->execute("CREATE TABLE test(id INT, label CHAR(1))"); //create table with (column name as id accepting INT) and (column name as label accepting CHAR(1))
		stmt->execute("INSERT INTO test(id, label) VALUES (1, 'a')"); //insert into 'test' table with (1 and 'a')

		delete stmt;
		delete con;
		/*According to documentation,
		*         You must free the sql::Statement and sql::Connection objects explicitly using delete
		*                 But do not explicitly free driver, the connector object. Connector/C++ takes care of freeing that. */

	/*} catch (sql::SQLException &e) {
		cout << "# ERR: " << e.what();
		cout << " (MySQL error code: " << e.getErrorCode();
		cout << ", SQLState: " << e.getSQLState() << " )" << endl;
	}

	cout << "Successfully ended" << endl;
	return EXIT_SUCCESS;*/
	
	/*Admin admin;
	admin.add_user("Thomas",1);
	admin.add_user("Marcos",1);
	admin.add_user("Leo",1);
	admin.add_user("Lucas",1);

	admin.list_users();

	admin.del_user(5);*/
	
		

	    while(true) {
		
		int id;
		Admin admin;
		string user_name;
		int is_admin;
		string phone_number;
		string allowed_entry;
		string allowed_leave;	
        int desiredFunction;

        cout << endl << "----------------------------------" << endl;
        cout << "Funções disponíveis" << endl;
        cout << "1 - Adicionar usuário" << endl;
        cout << "2 - Listar usuários" << endl;
        cout << "3 - Deletar usuário" << endl;
        cout << "4 - Modificar usuário" << endl;
        cout << "Digite a função desejada > ";
        cin >> desiredFunction;

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

			admin.add_user(user_name,is_admin,phone_number,allowed_entry,allowed_leave);
			cout << "usuário adicionado com sucesso" << endl;
			break;

            case 2:
            admin.list_users();

            break;

            case 3:
           
			cout << "Digite o id do usuário" << endl;
			cin >> id;
			admin.del_user(id);
			cout << "usuário deletado com sucesso" << endl;
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

			admin.update_user(id, is_admin, allowed_entry, allowed_leave);
			cout << "usuario atualizado" << endl;

            break;

            default:
            break;
        }
    }

    return 0;

}
