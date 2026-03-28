using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;
using static DocPlus.Entities.Utility.DBConnection;

namespace DocPlus.Entities.Utility
{
    public class DBConnection : IDisposable
    {
        private readonly IDBConnection con;
        public delegate void Callback(DataSet ds);

        #region IDBConnection Members

        public DBConnection()
        {
            con = new MSSqlDBConnection();
        }

        public DBConnection(bool IsRollback)
        {
            con = new MSSqlDBConnection();
        }

        public DBConnection(string connectionString)
        {
            con = new MSSqlDBConnection(connectionString);
        }

        public IDbCommand LastCommand
        {
            get
            {
                // TODO:  Add DBConnection.LastCommand getter implementation
                return con.LastCommand;
            }
        }

        public IDataReader ExecuteReader(string spName, SqlParameter param)
        {
            // TODO:  Add DBConnection.ExecuteReader implementation
            return con.ExecuteReader(spName, param);
        }

        public IDataReader ExecuteReader(string spName, SqlParameter[] param)
        {
            // TODO:  Add DBConnection.ExecuteReader implementation
            return con.ExecuteReader(spName, param);
        }

        public IDataReader ExecuteReader(string cmdText, CommandType cmdType, SqlParameter param)
        {
            // TODO:  Add DBConnection.ExecuteReader implementation
            return con.ExecuteReader(cmdText, cmdType, param);
        }

        public IDataReader ExecuteReader(string cmdText, CommandType cmdType, SqlParameter[] param)
        {
            // TODO:  Add DBConnection.ExecuteReader implementation
            return con.ExecuteReader(cmdText, cmdType, param);
        }

        public DataSet ExecuteDataSet(string spName, SqlParameter param)
        {
            // TODO:  Add DBConnection.ExecuteDataSet implementation
            return con.ExecuteDataSet(spName, param);
        }

        public DataSet ExecuteDataSetRollback(string cmdText, SqlParameter[] param, Callback Upload = null)
        {
            return con.ExecuteDataSetRollback(cmdText, param, Upload);
        }

        public DataSet ExecuteDataSet(string spName, SqlParameter[] param)
        {
            return con.ExecuteDataSet(spName, param);
        }

        public DataSet ExecuteDataSet(string cmdText, CommandType cmdType, SqlParameter param)
        {
            return con.ExecuteDataSet(cmdText, cmdType, param);
        }

        public DataSet ExecuteDataSet(string cmdText, CommandType cmdType, SqlParameter[] param)
        {
            // TODO:  Add DBConnection.ExecuteDataSet implementation
            return con.ExecuteDataSet(cmdText, cmdType, param);
        }

        public Object ExecuteScaler(string spName, SqlParameter param)
        {
            // TODO:  Add DBConnection.ExecuteScaler implementation
            return con.ExecuteScaler(spName, param);
        }

        public Object ExecuteScaler(string spName, SqlParameter[] param)
        {
            // TODO:  Add DBConnection.ExecuteScaler implementation
            return con.ExecuteScaler(spName, param);
        }

        public Object ExecuteScaler(string cmdText, CommandType cmdType, SqlParameter param)
        {
            // TODO:  Add DBConnection.ExecuteScaler implementation
            return con.ExecuteScaler(cmdText, cmdType, param);
        }

        public Object ExecuteScaler(string cmdText, CommandType cmdType, SqlParameter[] param)
        {
            // TODO:  Add DBConnection.ExecuteScaler implementation
            return con.ExecuteScaler(cmdText, cmdType, param);
        }

        public int ExecuteNonQueryRollBack(string spName, SqlParameter[] param)
        {
            // TODO:  Add DBConnection.ExecuteNonQuery implementation
            return con.ExecuteNonQueryRollback(spName, param);
        }

        public int ExecuteNonQuery(string cmdText, CommandType cmdType, SqlParameter param)
        {
            // TODO:  Add DBConnection.ExecuteNonQuery implementation
            return con.ExecuteNonQuery(cmdText, cmdType, param);
        }

        public int ExecuteNonQuery(string cmdText, CommandType cmdType, SqlParameter[] param)
        {
            // TODO:  Add DBConnection.ExecuteNonQuery implementation
            return con.ExecuteNonQuery(cmdText, cmdType, param);
        }

        #endregion

        #region IDisposable Members

        public void Dispose()
        {
            // TODO:  Add DBConnection.Dispose implementation
            con.Dispose();
        }

        #endregion
    }
    public class MSSqlDBConnection : IDBConnection
    {
        #region Fields
        private SqlConnection sqlCon;
        //private bool IsRollback;
        private SqlCommand _LastCommand;
        public string _ConnectString;
        public IConfiguration Configuration { get; }
        #endregion

        #region Constructor / Distructor

        public MSSqlDBConnection(string connectionString)
        {
            _ConnectString = connectionString;
        }
        public MSSqlDBConnection()
        {
            //
            // TODO: Add constructor logic here
            //
            _ConnectString = Configuration.GetConnectionString("ConnectionString");

        }
        ~MSSqlDBConnection()
        {
            Dispose(false);
        }

        #endregion

        #region Properties

        public IDbCommand LastCommand
        {
            get
            {
                return (IDbCommand)_LastCommand;
            }
        }

        #endregion

        #region Dispose
        public void Dispose()
        {
            //dispose zzzz
            Dispose(true);
        }

        protected void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (sqlCon != null) sqlCon.Dispose();
            }
        }
        #endregion

        #region SqlConnection
        public SqlConnection GetConnection()
        {
            if (sqlCon == null) { sqlCon = this.NewConnection; }
            if (sqlCon.State != ConnectionState.Open) { sqlCon.Open(); }
            return sqlCon;
        }

        private SqlConnection GetConnection(bool createNew)
        {
            if (createNew) { return this.NewConnection; }
            else { return GetConnection(); }
        }

        private SqlConnection NewConnection
        {
            get
            {
                SqlConnection FConnection = new SqlConnection(_ConnectString);
                if (FConnection.State != ConnectionState.Open)
                {
                    FConnection.Open();
                }
                return FConnection;
            }
        }
        #endregion

        #region ExecuteReader

        public IDataReader ExecuteReader(string spName, SqlParameter param)
        {
            //create new db connection
            return this.ExecuteReader(spName, new SqlParameter[] { (SqlParameter)param });
        }

        public IDataReader ExecuteReader(string spName, SqlParameter[] param)
        {
            //create new db connection
            return this.ExecuteReader(spName, CommandType.StoredProcedure, param);
        }

        public IDataReader ExecuteReader(string cmdText, CommandType cmdType, SqlParameter param)
        {
            //create new db connection
            return this.ExecuteReader(cmdText, cmdType, new SqlParameter[] { param });
        }

        public IDataReader ExecuteReader(string cmdText, CommandType cmdType, SqlParameter[] param)
        {
            //create new db connection
            SqlConnection con = GetConnection(true);
            //prepare command
            SqlCommand cmd = PrepareCommand(cmdText, param);
            cmd.Connection = con;
            cmd.CommandType = cmdType;
            _LastCommand = cmd;
            return (IDataReader)cmd.ExecuteReader(CommandBehavior.CloseConnection);
        }
        #endregion

        #region ExecuteDataSet

        public DataSet ExecuteDataSet(string spName, SqlParameter param)
        {
            return this.ExecuteDataSet(spName, new SqlParameter[] { param });
        }

        public DataSet ExecuteDataSet(string spName, SqlParameter[] param)
        {
            return this.ExecuteDataSet(spName, CommandType.StoredProcedure, param);
        }

        public DataSet ExecuteDataSet(string cmdText, CommandType cmdType, SqlParameter param)
        {
            return this.ExecuteDataSet(cmdText, cmdType, new SqlParameter[] { param });
        }

        public DataSet ExecuteDataSet(string cmdText, CommandType cmdType, SqlParameter[] param)
        {
            //create new db connection
            SqlConnection con = GetConnection();
            //prepare command
            SqlCommand cmd = PrepareCommand(cmdText, param);
            cmd.CommandType = cmdType;
            cmd.Connection = con;
            SqlDataAdapter da = new SqlDataAdapter(cmd);
            var ds = new DataSet();
            da.Fill(ds);
            da.Dispose();
            _LastCommand = cmd;
            return ds;
        }

        public DataSet ExecuteDataSetRollback(string cmdText, SqlParameter[] param, Callback Upload)
        {
            //create new db connection
            SqlConnection con = GetConnection();
            //con.Open();
            SqlTransaction transction = con.BeginTransaction();

            //prepare command
            SqlCommand cmd = PrepareCommand(cmdText, param);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Connection = con;
            cmd.CommandTimeout = 0;

            SqlDataAdapter da = new SqlDataAdapter(cmd);
            da.SelectCommand.Transaction = transction;
            var ds = new DataSet();

            try
            {
                da.Fill(ds);
                if (Upload != null)
                    Upload(ds);

                transction.Commit();
            }
            catch (Exception)
            {
                transction.Rollback();
                throw;
            }
            finally
            {
                da.Dispose(); con.Close();
                _LastCommand = cmd;
            }

            return ds;
        }

        #endregion

        #region ExecuteScaler

        public Object ExecuteScaler(string spName, SqlParameter param)
        {
            return this.ExecuteScaler(spName, CommandType.StoredProcedure, new SqlParameter[] { param });
        }

        public Object ExecuteScaler(string spName, SqlParameter[] param)
        {
            return this.ExecuteScaler(spName, CommandType.StoredProcedure, param);
        }

        public Object ExecuteScaler(string cmdText, CommandType cmdType, SqlParameter param)
        {
            return this.ExecuteScaler(cmdText, cmdType, new SqlParameter[] { param });
        }

        public Object ExecuteScaler(string cmdText, CommandType cmdType, SqlParameter[] param)
        {
            SqlConnection con = GetConnection();
            SqlCommand cmd = PrepareCommand(cmdText, param);
            cmd.Connection = con; ;
            cmd.CommandType = cmdType;
            _LastCommand = cmd;
            return cmd.ExecuteScalar();
        }
        #endregion

        #region ExecuteNonQuery

        public int ExecuteNonQuery(string spName, SqlParameter param)
        {
            return this.ExecuteNonQueryRollback(spName, new SqlParameter[] { param });
        }

        public int ExecuteNonQueryRollback(string spName, SqlParameter[] param)
        {
            return this.ExecuteNonQueryRollback(spName, CommandType.StoredProcedure, param);
        }

        public int ExecuteNonQuery(string cmdText, CommandType cmdType, SqlParameter param)
        {
            return this.ExecuteNonQuery(cmdText, CommandType.StoredProcedure, new SqlParameter[] { param });
        }

        public int ExecuteNonQuery(string cmdText, CommandType cmdType, SqlParameter[] param)
        {
            SqlCommand cmd = PrepareCommand(cmdText, param);
            cmd.Connection = GetConnection();
            cmd.CommandType = cmdType;
            _LastCommand = cmd;
            return cmd.ExecuteNonQuery();
        }

        public int ExecuteNonQueryRollback(string cmdText, CommandType cmdType, SqlParameter[] param)
        {
            int result = 0;
            SqlCommand cmd = PrepareCommand(cmdText, param);

            if (true)
            {
                SqlConnection conn = new SqlConnection(_ConnectString);
                conn.Open();
                cmd.Connection = conn;
                SqlTransaction tran = conn.BeginTransaction();
                cmd.Transaction = tran;
                try
                {
                    cmd.CommandType = cmdType;
                    _LastCommand = cmd;
                    //cmd.CommandTimeout = 60;
                    result = cmd.ExecuteNonQuery();
                    tran.Commit();
                }
                catch (Exception)
                {
                    tran.Rollback();
                    throw;
                }
            }

            return result;
        }

        #endregion

        #region PrepareCommand

        private SqlCommand PrepareCommand(string spName, SqlParameter[] param)
        {
            SqlCommand cmd = new SqlCommand(spName)
            {
                CommandType = CommandType.StoredProcedure
            };

            foreach (SqlParameter p in param)
            {
                cmd.Parameters.Add(p);
            }
            return cmd;
        }

        #endregion
    }
    public interface IDBConnection : IDisposable
    {
        #region Properties
        IDbCommand LastCommand
        {
            get;
        }

        #endregion

        #region ExecuteReader

        IDataReader ExecuteReader(string spName, SqlParameter param);
        IDataReader ExecuteReader(string spName, SqlParameter[] param);
        IDataReader ExecuteReader(string cmdText, CommandType cmdType, SqlParameter param);
        IDataReader ExecuteReader(string cmdText, CommandType cmdType, SqlParameter[] param);

        #endregion

        #region ExecuteDataSet

        DataSet ExecuteDataSet(string spName, SqlParameter param);
        DataSet ExecuteDataSetRollback(string spName, SqlParameter[] param, Callback Upload);
        DataSet ExecuteDataSet(string spName, SqlParameter[] param);
        DataSet ExecuteDataSet(string cmdText, CommandType cmdType, SqlParameter param);
        DataSet ExecuteDataSet(string cmdText, CommandType cmdType, SqlParameter[] param);

        #endregion

        #region ExecuteScaler

        Object ExecuteScaler(string spName, SqlParameter param);
        Object ExecuteScaler(string spName, SqlParameter[] param);
        Object ExecuteScaler(string cmdText, CommandType cmdType, SqlParameter param);
        Object ExecuteScaler(string cmdText, CommandType cmdType, SqlParameter[] param);

        #endregion

        #region ExecuteNonQuery

        int ExecuteNonQuery(string spName, SqlParameter param);
        //int ExecuteNonQuery(string spName, SqlParameter[] param);
        int ExecuteNonQueryRollback(string spName, SqlParameter[] param);
        int ExecuteNonQuery(string cmdText, CommandType cmdType, SqlParameter param);
        int ExecuteNonQuery(string cmdText, CommandType cmdType, SqlParameter[] param);

        #endregion
    }
}
