exports.getContact = (req, res) => {
    let contacts = [];
    const Contact = require(global.appRoot + 'models/contact');
    Contact.find({}, (err, results) => {
        if (err) {
            return;
        }
        contacts = results;
        res.render('contact', {
            title: 'Contact',
            contacts: contacts
        });
    })
};

exports.getAllContacts = (req, res) => {

}
exports.postContact = (req, res) => {
    req.assert('name', 'Name cannot be blank').notEmpty();
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('message', 'Message cannot be blank').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/contact');
    }

    const Contact = require(global.appRoot + 'models/contact');
    console.log(req.body);
    var contact = new Contact();
    contact.email = req.body.email;
    contact.name = req.body.name;
    contact.message = req.body.message;
    contact.save(function (err, result) {
        if (err) {
            req.flash('errors', errors);
            return res.redirect('/contact');
        }
        console.log(result);
        req.flash('success', { msg: 'Email has been sent successfully!' });
        return res.redirect('/contact');
    });

    // req.flash('success', { msg: 'Email has been sent successfully!' });
    // res.redirect('/contact');
};
