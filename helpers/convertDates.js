export default date => {
    var tanggals = new Date(date)
    var tanggal_fix = 
    tanggals.getUTCFullYear() + '-' +
    ('00' + (tanggals.getUTCMonth()+1)).slice(-2) + '-' +
    ('00' + tanggals.getUTCDate()).slice(-2);

    return tanggal_fix;
}
