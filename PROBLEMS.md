- Had to downgrade Nextjs from version 15 to 14, in order for AntD to work.

- got  error: duplicate key value violates unique constraint "transactions_pkey", even that i didin't
  violate this constraint, these were out of sync:
  SELECT MAX(the_primary_key) FROM the_table;
  SELECT nextval(pg_get_serial_sequence('the_table', 'the_primary_key'));

  we need update it using:
  SELECT setval(pg_get_serial_sequence('the_table', 'the_primary_key'), (SELECT MAX(the_primary_key) FROM the_table) + 1);
  so:
  SELECT setval(pg_get_serial_sequence('transactions', 'id'), (SELECT MAX(id) FROM transactions) + 1);
