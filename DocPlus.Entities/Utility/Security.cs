using System.ComponentModel;
using System.Data;
using System.Net;
using System.Net.Mail;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;

namespace DocPlus.Entities.Utility
{
    public class Security
    {
        //private static readonly int _saltSize = 32;
        private static readonly string SECURITY_KEY = "@WebPortal!2017#";

        /// <summary>
        /// Encrypt a string using dual encryption method. Returns a encrypted text.
        /// </summary>
        /// <returns>Returns encrypted string.</returns>
        public static string Encrypt(string toEncrypt)
        {
            #region
            try
            {
                bool useHashing = true;
                byte[] keyArray;
                byte[] toEncryptArray = UTF8Encoding.UTF8.GetBytes(toEncrypt);

                // Get the key from config file
                string key = SECURITY_KEY;
                if (useHashing)
                {
                    using (MD5CryptoServiceProvider hashmd5 = new MD5CryptoServiceProvider())
                    {
                        keyArray = hashmd5.ComputeHash(UTF8Encoding.UTF8.GetBytes(key));
                    }
                }
                else
                    keyArray = UTF8Encoding.UTF8.GetBytes(key);

                byte[] resultArray = null;
                using (TripleDESCryptoServiceProvider tdes = new TripleDESCryptoServiceProvider())
                {
                    tdes.Key = keyArray;
                    tdes.Mode = CipherMode.ECB;
                    tdes.Padding = PaddingMode.PKCS7;
                    ICryptoTransform cTransform = tdes.CreateEncryptor();
                    resultArray = cTransform.TransformFinalBlock(toEncryptArray, 0, toEncryptArray.Length);
                }
                string Res = Convert.ToBase64String(resultArray, 0, resultArray.Length);
                Res = Res.Replace('/', '$');
                Res = Res.Replace('+', '-');
                return Res;
            }
            catch (Exception)
            {
                throw;
            }
            #endregion
        }

        /// <summary>
        /// DeCrypt a string using dual encryption method. Return a DeCrypted clear string
        /// </summary>
        /// <returns>Returns decrypted text.</returns>
        public static string Decrypt(string cipherString)
        {
            #region
            try
            {
                cipherString = cipherString.Replace('$', '/');
                cipherString = cipherString.Replace('-', '+');

                bool useHashing = true;
                byte[] keyArray;
                byte[] toEncryptArray = Convert.FromBase64String(cipherString);

                //Get your key from config file to open the lock!
                string key = SECURITY_KEY;

                if (useHashing)
                {
                    using (MD5CryptoServiceProvider hashmd5 = new MD5CryptoServiceProvider())
                    {
                        keyArray = hashmd5.ComputeHash(UTF8Encoding.UTF8.GetBytes(key));
                    }
                }
                else
                    keyArray = UTF8Encoding.UTF8.GetBytes(key);

                byte[] resultArray = null;
                using (TripleDESCryptoServiceProvider tdes = new TripleDESCryptoServiceProvider())
                {
                    tdes.Key = keyArray;
                    tdes.Mode = CipherMode.ECB;
                    tdes.Padding = PaddingMode.PKCS7;

                    ICryptoTransform cTransform = tdes.CreateDecryptor();
                    resultArray = cTransform.TransformFinalBlock(toEncryptArray, 0, toEncryptArray.Length);
                }

                if (resultArray.Length > 0)
                    return UTF8Encoding.UTF8.GetString(resultArray);
                else
                    return string.Empty;
            }
            catch (Exception)
            {
                throw;
            }
            #endregion
        }
    }

    public static class Common
    {
        public static DataTable ToDataTable<T>(List<T> items)
        {
            DataTable dataTable = new DataTable(typeof(T).Name);
            //Get all the properties
            PropertyInfo[] Props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (PropertyInfo prop in Props)
            {
                //Setting column names as Property names
                dataTable.Columns.Add(prop.Name);
            }

            foreach (T item in items)
            {
                var values = new object[Props.Length];
                for (int i = 0; i < Props.Length; i++)
                {
                    //inserting property values to datatable rows
                    values[i] = Props[i].GetValue(item, null);
                }

                dataTable.Rows.Add(values);

            }
            //put a breakpoint here and check datatable
            return dataTable;
        }

        public static DataTable ConvertToDatatable<T>(List<T> data)
        {
            PropertyDescriptorCollection props = TypeDescriptor.GetProperties(typeof(T));
            DataTable table = new DataTable();
            for (int i = 0; i < props.Count; i++)
            {
                PropertyDescriptor prop = props[i];
                if (prop.PropertyType.IsGenericType && prop.PropertyType.GetGenericTypeDefinition() == typeof(Nullable<>))
                    table.Columns.Add(prop.Name, prop.PropertyType.GetGenericArguments()[0]);
                else
                    table.Columns.Add(prop.Name, prop.PropertyType);
            }
            object[] values = new object[props.Count];
            foreach (T item in data)
            {
                for (int i = 0; i < values.Length; i++)
                {
                    values[i] = props[i].GetValue(item);
                }
                table.Rows.Add(values);
            }
            return table;
        }

        public static List<T> ConvertToList<T>(DataTable dt)
        {
            List<T> data = new List<T>();
            foreach (DataRow row in dt.Rows)
            {
                T item = GetItem<T>(row);
                data.Add(item);
            }
            return data;
        }

        private static T GetItem<T>(DataRow dr)
        {
            Type temp = typeof(T);
            T obj = Activator.CreateInstance<T>();

            foreach (DataColumn column in dr.Table.Columns)
            {
                try
                {
                    //New Logic
                    List<PropertyInfo> objpro = (temp.GetProperties()).ToList<PropertyInfo>();
                    //List<PropertyInfo> testList = new List<PropertyInfo>(pros);
                    //var list = testList.Find(x => x.Name == column.ColumnName);
                    List<PropertyInfo> pro = (from propertyInfoItem in objpro
                                              where (propertyInfoItem.Name == column.ColumnName)
                                              select propertyInfoItem).ToList<PropertyInfo>();
                    if (pro.Count > 0)
                        pro[0].SetValue(obj, (dr[column.ColumnName] != DBNull.Value ? dr[column.ColumnName] : null), null);
                }
                catch (Exception)
                {
                    throw;
                }

                //Old Logic
                //foreach (PropertyInfo pro in temp.GetProperties())
                //{
                //    if (pro.Name == column.ColumnName)
                //    {
                //        try
                //        {
                //            pro.SetValue(obj, (dr[column.ColumnName] != DBNull.Value ? dr[column.ColumnName] : null), null);
                //        }
                //        catch (Exception)
                //        {
                //            throw;
                //        }
                //        break;
                //    }
                //}
            }

            return obj;
        }

        public static string GetIpAddress(String Model)  // Get IP Address
        {
            var ip = "";
            IPHostEntry ipEntry = Dns.GetHostEntry(Dns.GetHostName());
            IPAddress[] addr = ipEntry.AddressList;
            ip = addr[1].ToString();
            return ip;
        }

        public static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }
};